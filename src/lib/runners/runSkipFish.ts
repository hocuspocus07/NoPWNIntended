import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type AggressivenessLevel = 'low' | 'medium' | 'high' | 'insane';

export interface SkipfishResult {
  output: string;
  reportContent?: string;
  status: 'success' | 'error';
  log?: string;
}

export async function runSkipfish(
  target: string,
  aggressiveness: AggressivenessLevel = 'medium'
): Promise<SkipfishResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME || 'pwntools';

  if (!/^https?:\/\/[^\s\/$.?#].[^\s]*$/i.test(target)) {
    throw new Error('Invalid target URL format');
  }

  // "Health" check by running run-skipfish.sh on example.com
  try {
    const healthCheckCmd = `docker exec ${container} /docker/scripts/run-skipfish.sh "https://example.com" "low"`;
    const { stdout: healthStdout } = await asyncExec(healthCheckCmd);
    let healthResult;
    try {
      healthResult = JSON.parse(healthStdout);
    } catch (e) {
      throw new Error("Skipfish health check did not return JSON: " + healthStdout);
    }
    if (healthResult.status !== 'success') {
      throw new Error(
        `Skipfish env test failed: ${healthStdout}`
      );
    }
  } catch (e) {
    throw new Error(`Skipfish environment sanity check failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  const scanCmd = `docker exec ${container} /docker/scripts/run-skipfish.sh "${target}" "${aggressiveness}"`;
  let stdout = '', stderr = '';
  try {
    const result = await asyncExec(scanCmd);
    stdout = result.stdout;
    stderr = result.stderr;
  } catch (err: any) {
    stderr = err.stderr || '';
    stdout = err.stdout || '';
  }

  let result: SkipfishResult;
  try {
    if (!stdout || !stdout.trim()) {
      throw new Error('Skipfish returned empty output. Check installation and permissions.');
    }
    result = JSON.parse(stdout);
  } catch (parseError) {
    throw new Error(`Skipfish result is not valid JSON: ${stdout}\nStderr: ${stderr}`);
  }
  if (result.status === 'error') {
    throw new Error(`${result.output}${result.log ? "\nLog: " + result.log : ''}`);
  }
  console.log(result)
  return result;
}
