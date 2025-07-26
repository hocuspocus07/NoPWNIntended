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

export interface ExifToolOptions {
  outputFormat?: "human" | "json" | "csv" | "xml";
  groupNames?: boolean;
  binaryOutput?: boolean;
  showAllTags?: boolean;
  showCommonTags?: boolean;
  specificTags?: string;
  geotagsOnly?: boolean;
  removeMetadata?: boolean;
}

export async function runExifTool(
  file: Buffer | NodeJS.ReadableStream,
  options: ExifToolOptions = {}
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME;
  if (!container) throw new Error("Docker container name not defined");

  // input to Buffer
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
      "/docker/scripts/run-exiftool.sh",
      containerPath,
      options.outputFormat || "human",
      String(options.groupNames || false),
      String(options.binaryOutput || false),
      String(options.showAllTags || false),
      String(options.showCommonTags !== false),
      options.specificTags || "",
      String(options.geotagsOnly || false),
      String(options.removeMetadata || false)
    ];

    const { stdout } = await asyncExecFile("docker", args);

    return stdout;
  } catch (error) {
    throw new Error(`ExifTool failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up
    await Promise.all([
      fs.unlink(hostTempPath).catch(() => {}),
      asyncExecFile("docker", ["exec", container, "rm", "-f", containerPath]).catch(() => {})
    ]);
  }
}