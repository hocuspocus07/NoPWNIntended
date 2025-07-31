import fs from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { execFile } from "child_process";
import util from "util";
import crypto from "crypto";

const asyncExecFile = util.promisify(execFile);
const allowedArgs = ["-d", "-s", "-x", "-t"];

function validateArgs(args: string): boolean {
  const parts = args.trim().split(/\s+/);
  return parts.every((part) => allowedArgs.includes(part));
}

import { Readable } from "stream";

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: string | Buffer) => {
      if (typeof chunk === "string") {
        chunks.push(Buffer.from(chunk));
      } else {
        chunks.push(chunk);
      }
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}


export async function runObjdump(args: string, file: Buffer | NodeJS.ReadableStream): Promise<string> {
  if (!validateArgs(args)) {
    throw new Error("Invalid objdump arguments");
  }

  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined");

  const tempName = crypto.randomUUID();
  const hostTempPath = path.join(tmpdir(), tempName);

  let buffer: Buffer;

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if (file instanceof Readable) {
    buffer = await streamToBuffer(file);
  } else {
    throw new Error("Unsupported file input type, expected Buffer or Readable stream");
  }

  await fs.writeFile(hostTempPath, buffer);

  const containerPath = `/tmp/${tempName}`;
  await asyncExecFile("docker", ["cp", hostTempPath, `${container}:${containerPath}`]);

  const argsArray = args.trim().split(/\s+/);
  const dockerArgs = [
    "exec",
    container,
    "objdump",
    ...argsArray,
    containerPath,
  ];

  try {
    const { stdout } = await asyncExecFile("docker", dockerArgs,{ maxBuffer: 10 * 1024 * 1024 } );
    return stdout;
  } catch (error) {
    throw new Error(`Objdump failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await fs.unlink(hostTempPath).catch(() => {});
  }
}

