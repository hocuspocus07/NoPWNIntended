import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type XSSType = 'reflected' | 'dom' | 'stored';
type ScanType = 'detect' | 'payload';

export async function runXSStrike(
  url: string,
  params: string,
  threads: number = 10,
  options: {
    xssType?: XSSType;
    scanType?: ScanType;
    encode?: boolean;
  } = {}
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate URL format
  if (!url.match(/^https?:\/\/[^\s\/$.?#].[^\s]*$/i)) {
    throw new Error('Invalid URL format');
  }

  // validate parameters
  if (!params.match(/^[a-zA-Z0-9_,]+$/)) {
    throw new Error('Parameters must be comma-separated alphanumeric values');
  }

  // validate threads
  if (!Number.isInteger(threads) || threads <= 0 || threads > 20) {
    throw new Error('Threads must be an integer between 1 and 20');
  }

  const args = [
    url,
    params,
    threads.toString(),
    options.xssType || 'reflected',
    options.scanType || 'detect',
    options.encode ? 'true' : 'false'
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-xsstrike.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`XSStrike scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}