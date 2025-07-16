import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type NoSQLMode = 'detect' | 'exploit';

export async function runNoSQLExploitation(
  url: string,
  mode: NoSQLMode = 'detect'
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // Validate URL format
  if (!url.match(/^https?:\/\/[^\s\/$.?#].[^\s]*$/i)) {
    throw new Error('Invalid URL format');
  }

  const args = [
    url,
    mode
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-nosql.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`NoSQL exploitation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}