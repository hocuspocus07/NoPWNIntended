import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type AggressivenessLevel = 'low' | 'medium' | 'high' | 'insane';

export async function runSkipfish(
  target: string,
  aggressiveness: AggressivenessLevel = 'medium'
): Promise<{ output: string; reportPath: string }> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate URL format
  if (!target.match(/^https?:\/\/[^\s\/$.?#].[^\s]*$/i)) {
    throw new Error('Invalid target URL format');
  }

  const args = [
    target,
    aggressiveness
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-skipfish.sh ${args.join(' ')}`
    );
    
    const reportMatch = stdout.match(/HTML report saved to: (.+?\/index\.html)/);
    const reportPath = reportMatch ? reportMatch[1] : '';

    return {
      output: stdout,
      reportPath
    };
  } catch (error) {
    throw new Error(`Skipfish scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}