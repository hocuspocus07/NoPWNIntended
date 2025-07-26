import { execFile } from "child_process";
import path from "path";
import util from "util";
import { tmpdir } from "os";
import fs from "fs/promises";
import crypto from "crypto";

const asyncExecFile = util.promisify(execFile);
const allowedCommands = ["run", "break", "info"];

export async function runGdb(
  cmd: string,
  file: Buffer | ArrayBuffer
): Promise<string> {
  if (!allowedCommands.includes(cmd)) {
    throw new Error("Invalid gdb command");
  }

  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined"); // Convert ArrayBuffer to Buffer 

  const fileBuffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
  const tempName = crypto.randomUUID();
  const hostTempPath = path.join(tmpdir(), tempName);
  const containerPath = `/tmp/${tempName}`;

  await fs.writeFile(hostTempPath, fileBuffer);

  try {
    await asyncExecFile("docker", [
      "cp",
      hostTempPath,
      `${container}:${containerPath}`,
    ]);

    await asyncExecFile("docker", [
      "exec",
      container,
      "chmod",
      "+x",
      containerPath,
    ]);

    const scriptPath = "/app/docker/scripts/run-gdb.sh";
    const { stdout } = await asyncExecFile("docker", [
      "exec",
      container,
      "/app/docker/scripts/run-gdb.sh",
      cmd,
      containerPath,
    ]);
    return stdout;
  } catch (error: any) {
    throw new Error(`GDB failed: ${error.message || error}`);
  } finally {
    // Clean up
    await Promise.all([
      fs.unlink(hostTempPath).catch(() => {}),
      asyncExecFile("docker", [
        "exec",
        container,
        "rm",
        "-f",
        containerPath,
      ]).catch(() => {}),
    ]);
  }
}
