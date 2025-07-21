import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type AggressivenessLevel = 'low' | 'medium' | 'high' | 'insane';

export async function runNikto(
  target: string,
  aggressiveness: AggressivenessLevel = 'medium'
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  const args = [target, aggressiveness].join(' ');
  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-nikto.sh ${args}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`Nikto scan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}