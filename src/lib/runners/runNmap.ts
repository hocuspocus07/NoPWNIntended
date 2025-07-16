import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type PortSpec = string | 'top-ports'; // e.g. "21,22,80" or "top-ports"
type NmapScripts = string; // comma-separated scripts

export async function runNmap(
  target: string,
  ports: PortSpec = 'top-ports',
  scanOpts: string = '-sV -O -A -sC',
  scripts: NmapScripts = ''
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // Prepare arguments with proper escaping
  const args = [
    target,
    ports,
    scanOpts,
    scripts
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-nmap.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`Nmap scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}