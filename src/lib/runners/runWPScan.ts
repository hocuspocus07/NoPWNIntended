import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type AggressivenessLevel = 'low' | 'medium' | 'high' | 'insane';

export async function runWPScan(
  target: string,
  options: {
    scanHidden?: boolean;
    aggressiveness?: AggressivenessLevel;
  } = {}
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate URL format
  if (!target.match(/^https?:\/\/[^\s\/$.?#].[^\s]*$/i)) {
    throw new Error('Invalid target URL format');
  }

  const args = [
    target,
    options.scanHidden ? 'true' : 'false',
    options.aggressiveness || 'medium'
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-wpscan.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`WPScan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}