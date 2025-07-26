import { execFile } from "child_process";
import util from "util";

const asyncExecFile = util.promisify(execFile);

export interface HoleheOptions {
  onlyUsed?: boolean;
  verbose?: boolean;
  timeout?: number;
  exclude?: string;
  outputFormat?: "text" | "json" | "csv";
}

export async function runHolehe(
  email: string,
  options: HoleheOptions = {}
): Promise<string> {
  if (!email) throw new Error("Email is required");

  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined");

  try {
    const args = [
      "exec",
      container,
      "/docker/scripts/run-holehe.sh",
      email,
      String(options.onlyUsed || false),
      String(options.verbose || false),
      String(options.timeout || 5),
      options.exclude || "",
      options.outputFormat || "text"
    ];

    const { stdout } = await asyncExecFile("docker", args);
    return stdout;
  } catch (error) {
    throw new Error(`Holehe failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}