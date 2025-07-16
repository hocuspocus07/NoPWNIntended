import { exec } from "child_process";
import util from "util";

const asyncExec = util.promisify(exec);

export async function runAmass(
  domain: string,
  bruteforce: boolean,
  passive: boolean,
  active: boolean,
  threads: number
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  const args = [
    domain,
    bruteforce.toString(),
    passive.toString(),
    active.toString(),
    threads.toString(),
  ].map((arg) => `'${arg.replace(/'/g, "'\\''")}'`);

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-amass.sh ${args.join(" ")}`
    );
    return stdout;
  } catch (error) {
    throw new Error(
      `Amass execution failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
