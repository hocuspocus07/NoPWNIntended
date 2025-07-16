import { exec } from 'child_process';
import util from 'util';

const asyncExec = util.promisify(exec);

type WordlistPreset = 'common-2500' | 'big-10k' | 'mega-50k' | string;
type Extensions = string; 

export async function runFFUF(
  url: string,
  wordlist: WordlistPreset,
  threads: number,
  extensions: Extensions = '',
  recursive: boolean = false,
  followRedirects: boolean = false
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;

  const args = [
    url,
    wordlist,
    threads.toString(),
    extensions,
    recursive.toString().toLowerCase(),
    followRedirects.toString().toLowerCase()
  ].map(arg => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-ffuf.sh ${args.join(' ')}`
    );
    return stdout;
  } catch (error) {
    throw new Error(`FFUF execution failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}