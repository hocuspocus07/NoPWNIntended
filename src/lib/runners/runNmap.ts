import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

interface NmapResult {
  success: boolean;
  output?: string;
  error?: string;
  logs?: string;
}

export async function runNmap(
  target: string,
  ports: string,
  scripts: string,
  options: string = '-sV'
): Promise<NmapResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME || 'my-tools-container';

  // Validate target for security (basic, for IP or hostname)
  if (!/^[a-zA-Z0-9.-]+$/.test(target)) {
    return {
      success: false,
      error: 'Invalid target format - only alphanumeric, dot, and hyphen allowed',
    };
  }

  // Compose safe shell arguments for the script
  const shellArgs = [
  target,
  ports,
  scripts,
  options
].map(arg => arg ?? '').join(' ')

  try {
    // Optionally get log preview before the scan
    const { stdout: preLogs } = await asyncExec(
      `docker exec ${container} tail -n 50 /var/log/nmap_scan.log || echo "No log file yet"`
    );

    // Execute the scan (calls your bash script in the running container)
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-nmap.sh ${shellArgs}`,
      { maxBuffer: 1024 * 1024 * 10 }
    );

    // Optionally get log preview after the scan
    const { stdout: postLogs } = await asyncExec(
      `docker exec ${container} tail -n 100 /var/log/nmap_scan.log || echo "No log file yet"`
    );

    return {
      success: true,
      output: stdout,
      logs: `=== PRE-SCAN LOGS ===\n${preLogs}\n\n=== POST-SCAN LOGS ===\n${postLogs}`
    };
  } catch (error: any) {
    // Grab logs for troubleshooting on error
    const { stdout: fullLogs } = await asyncExec(
      `docker exec ${container} cat /var/log/nmap_scan.log || echo "Logs unavailable"`
    );
    return {
      success: false,
      error: error instanceof Error ? error.message.split('\n')[0] : String(error),
      logs: fullLogs
    };
  }
}
