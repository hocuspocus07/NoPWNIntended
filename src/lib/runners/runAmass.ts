import { exec } from "child_process";
import util from "util";

const asyncExec = util.promisify(exec);

export async function runAmass(
  domain: string,
  bruteforce: boolean,
  passive: boolean,
  active: boolean,
) {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  const args = [
    domain,
    String(bruteforce),
    String(passive),
    String(active),
  ].join(' ');

  try {
    const { stdout } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-amass.sh ${args}`
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
