import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type ScanType = 'detect' | 'payload';

export async function runXSStrike(
  url: string,
  threads: number = 10,
  options: {
    scanType?: ScanType;
    encode?: boolean;
  } = {}
): Promise<string> {
  const testResponse = await fetch(url, { method: 'HEAD' });
    if (!testResponse.ok) {
      throw new Error(`Target URL returned ${testResponse.status}`);
    }
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate URL format
  if (!url.match(/^https?:\/\/[^\s\/$.?#].[^\s]*$/i)) {
    throw new Error('Invalid URL format');
  }

  // validate threads
  if (!Number.isInteger(threads) || threads <= 0 || threads > 20) {
    throw new Error('Threads must be an integer between 1 and 20');
  }

  const args = [
    url,
    threads.toString(),
    options.scanType || 'detect',
    options.encode ? 'true' : 'false'
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-xsstrike.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error:any) {
    throw new Error(`XSStrike scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
