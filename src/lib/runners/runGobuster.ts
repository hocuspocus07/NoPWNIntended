import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type WordlistPreset = 'common-2500' | 'big-10k' | 'mega-50k' | string;
type Extensions = string; // comma-separated extensions

export async function runGoBuster(
  url: string,
  wordlist: WordlistPreset,
  threads: number,
  extensions:Extensions= '',
  followRedirects: boolean = false
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  const args = [
    url,
    wordlist,
    threads.toString(),
    extensions,
    followRedirects.toString().toLowerCase()
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-gobuster.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`GoBuster execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}