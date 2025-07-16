import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type SqlmapMode = 'detect' | 'exploit';

export async function runSqlmap(
  url: string,
  params: string,
  threads: number = 10,
  mode: SqlmapMode = 'detect'
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate URL format
  if (!url.match(/^https?:\/\/.+/i)) {
    throw new Error('Invalid URL format');
  }

  // validate parameters
  if (!params.match(/^[a-zA-Z0-9_,]+$/)) {
    throw new Error('Invalid parameters format');
  }

  // validate threads
  if (!Number.isInteger(threads) || threads <= 0 || threads > 20) {
    throw new Error('Threads must be an integer between 1 and 20');
  }

  const args = [
    url,
    params,
    threads.toString(),
    mode
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-sqlmap.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`SQLMap scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}