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
  ports: string = '',
  scripts: string = '',
  options: string = ''
): Promise<NmapResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME || 'nmap-container';

  // Enhanced security validation
  if (!/^[a-zA-Z0-9.-]+$/.test(target)) {
    return {
      success: false,
      error: 'Invalid target format - only alphanumeric, dot, and hyphen allowed',
    };
  }

  // Validate ports format
  if (ports && !/^[0-9,-]*$/.test(ports)) {
    return {
      success: false,
      error: 'Invalid ports format - only numbers, commas and hyphens allowed',
    };
  }

  // Build command parts safely
  const cmdParts = [
    'nmap',
    options,
    ports ? `-p ${ports}` : '',
    scripts ? `--script ${scripts}` : '',
    target
  ].filter(Boolean); // Remove empty strings

  try {
    const { stdout, stderr } = await asyncExec(
      `docker exec ${container} ${cmdParts.join(' ')}`,
      { 
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 600000 // 10 minute timeout
      }
    );

    // Get recent logs for context
    const { stdout: logs } = await asyncExec(
      `docker logs --tail 100 ${container} 2>&1 || echo "Logs unavailable"`
    );

    return {
      success: true,
      output: stdout,
      logs: logs,
      error: stderr
    };
  } catch (error: any) {
    // Get full logs on error
    const { stdout: fullLogs } = await asyncExec(
      `docker logs --tail 500 ${container} 2>&1 || echo "Logs unavailable"`
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      logs: fullLogs
    };
  }
}