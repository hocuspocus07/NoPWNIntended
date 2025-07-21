import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

interface FFUFResult {
  success: boolean;
  data?: any;  // Parsed JSON output
  error?: string;
}

export async function runFFUF(
  url: string,
  wordlist: string,
  threads: number,
  extensions: string = '',
  recursive: boolean = false,
  followRedirects: boolean = false
): Promise<FFUFResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  // Input validation
  if (!url.match(/^https?:\/\/.+/i)) {
    return {
      success: false,
      error: 'Invalid URL format'
    };
  }

  const args = [
    url,
    wordlist,
    Math.max(1, Math.min(threads, 100)).toString(),
    extensions.replace(/[^a-zA-Z0-9,]/g, ''),
    String(recursive),
    String(followRedirects)
  ];

  try {
    const { stdout, stderr } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-ffuf.sh ${args.join(' ')}`,
      { maxBuffer: 1024 * 1024 * 10 }
    );
  
    // Return everything as a string
    return {
      success: true,
      data: {
        stdout,
        stderr
      }
    };
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: err
    };
  }}