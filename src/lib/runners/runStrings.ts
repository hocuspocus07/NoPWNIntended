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

export async function runStrings(file: Buffer | NodeJS.ReadableStream): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined");

  // Convert input to Buffer
  const fileBuffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file);
  const tempName = crypto.randomUUID();
  const hostTempPath = path.join(tmpdir(), tempName);
  const containerPath = `/tmp/${tempName}`;

  await fs.writeFile(hostTempPath, fileBuffer);

  try {
    await asyncExecFile("docker", ["cp", hostTempPath, `${container}:${containerPath}`]);

    const { stdout } = await asyncExecFile("docker", [
      "exec",
      container,
      "strings",
      containerPath
    ]);

    return stdout;
  } catch (error) {
    throw new Error(`Strings failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up
    await Promise.all([
      fs.unlink(hostTempPath).catch(() => {}),
      asyncExecFile("docker", ["exec", container, "rm", "-f", containerPath]).catch(() => {})
    ]);
  }
}