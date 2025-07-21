import { exec } from "child_process";
import util from "util";

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
    throw new Error("Invalid domain format");
  }

  const args = [
    domain,
    options.recursive ? "true" : "false",
    options.raw ? "true" : "false",
  ].join(" ");

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-whois.sh ${args}`
    );

    if (options.raw) {
      return { rawOutput: stdout };
    }

    const result: WhoisResult = {
      domainName: extractValueMulti(stdout, ["Domain Name"]),
      registrar: extractValueMulti(stdout, [
        "Registrar",
        "Sponsoring Registrar",
        "Registrar Name",
      ]),
      updatedDate: extractValueMulti(stdout, [
        "Updated Date",
        "Last Updated On",
        "Last Modified",
      ]),
      creationDate: extractValueMulti(stdout, [
        "Creation Date",
        "Registered On",
      ]),
      expiryDate: extractValueMulti(stdout, [
        "Registrar Registration Expiration Date",
        "Registry Expiry Date",
        "Expiration Date",
        "Expiry Date",
        "paid-till",
      ]),
      nameServers: extractNameServers(stdout),
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
    throw new Error(
      `WHOIS lookup failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// helper functions
function extractValueMulti(output: string, keys: string[]): string | undefined {
  const lines = output.split(/\r?\n/);
  for (const key of keys) {
    const regex = new RegExp(`^${key}\\s*:\\s*(.*)$`, "i");
    for (const line of lines) {
      const match = regex.exec(line);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }
  return undefined;
}
function extractNameServers(output: string): string[] {
  const nsMatches = output.match(/name server:\s*(.+)/gi);
  if (!nsMatches) return [];
  return nsMatches.map((ns) => ns.split(":")[1].trim()).filter((ns) => ns);
}
