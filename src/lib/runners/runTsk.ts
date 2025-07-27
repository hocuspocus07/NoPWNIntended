import { execFile } from "child_process";
import util from "util";
import { tmpdir } from "os";
import fs from "fs/promises";
import crypto from "crypto";
import { Readable } from "stream";
import path from "path";

const asyncExecFile = util.promisify(execFile);

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: string | Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export interface TskOptions {
  command: string;
  inode?: string;
}

export async function runTsk(
  file: Buffer | NodeJS.ReadableStream,
  options: TskOptions
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined");

  const fileBuffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file);
  const tempName = crypto.randomUUID();
  const hostTempPath = path.join(tmpdir(), tempName);
  const containerPath = `/tmp/${tempName}`;

  await fs.writeFile(hostTempPath, fileBuffer);

  try {
    await asyncExecFile("docker", ["cp", hostTempPath, `${container}:${containerPath}`]);

    const args = [
      "exec",
      container,
      "/docker/scripts/run-tsk.sh",
      containerPath,
      options.command
    ];

    if (options.command === "icat" && options.inode) {
      args.push(options.inode);
    }

    const { stdout } = await asyncExecFile("docker", args);
    return stdout;
  } catch (error) {
    throw new Error(`TSK failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await Promise.all([
      fs.unlink(hostTempPath).catch(() => {}),
      asyncExecFile("docker", ["exec", container, "rm", "-f", containerPath]).catch(() => {})
    ]);
  }
}