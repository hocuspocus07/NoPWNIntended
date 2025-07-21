import { execFile } from "child_process";
import util from 'util'

const asyncExecFile = util.promisify(execFile);


type AggressivenessLevel = 'low' | 'medium' | 'high' | 'insane';

export async function runWPScan(
  target: string,
  options: {
    scanHidden?: boolean;
    aggressiveness?: AggressivenessLevel;
  } = {}
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined!");
  if (!target.match(/^https?:\/\/[^\s\/$.?#].[^\s]*$/i)) {
    throw new Error('Invalid target URL format');
  }

  const args = [
    "/docker/scripts/run-wpscan.sh",
    target,
    options.scanHidden ? "true" : "false",
    options.aggressiveness || "medium"
  ];

  try {
    // execFile's first arg is the command, second is the array of args
    const { stdout } = await asyncExecFile("docker", ["exec", container, ...args]);
    return stdout;
  } catch (error) {
    throw new Error(`WPScan failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}