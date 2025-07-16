import { exec } from "child_process";
import util from "util";

const asyncExec = util.promisify(exec);

type Wordlist = "common-2500" | "big-10k" | "mega-50k";
type Extensions = string;

export async function runDirSearch(
  url: string,
  wordlist: Wordlist,
  threads: number,
  extensions: Extensions,
  recursive: boolean,
  follow_redirects: boolean
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  try {
    const args = [
      url,
      wordlist,
      threads.toString(),
      extensions,
      String(recursive).toLowerCase(),
      String(follow_redirects).toLowerCase(),
    ];

    // Escape shell arguments
    const escapedArgs = args
      .map((arg) => `'${arg.replace(/'/g, "'\\''")}'`)
      .join(" ");

    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-dirsearch.sh ${escapedArgs}`
    );

    return stdout;
  } catch (error) {
    throw new Error(
      `execution failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
