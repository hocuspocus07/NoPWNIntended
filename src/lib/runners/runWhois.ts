import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

export interface WhoisOptions {
  recursive?: boolean;
  raw?: boolean;
}

export interface WhoisResult {
  domainName?: string;
  registrar?: string;
  updatedDate?: string;
  creationDate?: string;
  expiryDate?: string;
  nameServers?: string[];
  registrarWhois?: string;
  rawOutput?: string;
}

export async function runWhois(
  domain: string,
  options: WhoisOptions = {}
): Promise<WhoisResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate domain format
  if (!domain.match(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i)) {
    throw new Error('Invalid domain format');
  }

  const args = [
    domain,
    options.recursive ? 'true' : 'false',
    options.raw ? 'true' : 'false'
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-whois.sh ${args.join(' ')}`
    );

    if (options.raw) {
      return { rawOutput: stdout };
    }

    const result: WhoisResult = {
      domainName: extractValue(stdout, 'domain name'),
      registrar: extractValue(stdout, 'registrar'),
      updatedDate: extractValue(stdout, 'updated date'),
      creationDate: extractValue(stdout, 'creation date'),
      expiryDate: extractValue(stdout, 'expiry|expiration date'),
      nameServers: extractNameServers(stdout)
    };

    // handle recursive lookup if present
    if (options.recursive) {
      const recursiveMatch = stdout.match(/>>> Recursive WHOIS Lookup[\s\S]*/);
      if (recursiveMatch) {
        result.registrarWhois = recursiveMatch[0];
      }
    }

    return result;
  } catch (error) {
    throw new Error(`WHOIS lookup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// helper functions
function extractValue(output: string, pattern: string): string | undefined {
  const match = new RegExp(pattern, 'i').exec(output);
  return match ? match[0].split(':').slice(1).join(':').trim() : undefined;
}

function extractNameServers(output: string): string[] {
  const nsMatches = output.match(/name server:\s*(.+)/gi);
  if (!nsMatches) return [];
  return nsMatches.map(ns => ns.split(':')[1].trim()).filter(ns => ns);
}