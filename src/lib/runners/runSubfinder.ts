import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

export async function runSubfinder(domain: string): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // validate domain format
  if (!domain.match(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i)) {
    throw new Error('Invalid domain format');
  }

  try {
    const escapedDomain = `'${domain.replace(/'/g, "'\\''")}'`;
    
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-subfinder.sh ${escapedDomain}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`Subfinder execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}