import { execFile } from "child_process"
import util from "util"
import { tmpdir } from "os"
import fs from "fs/promises"
import crypto from "crypto"
import path from "path"

const asyncExecFile = util.promisify(execFile)

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: string | Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks)))
  })
}

function getImageMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".gif":
      return "image/gif"
    case ".webp":
      return "image/webp"
    case ".bmp":
      return "image/bmp"
    case ".tiff":
    case ".tif":
      return "image/tiff"
    default:
      return "application/octet-stream"
  }
}

export interface ExifToolOptions {
  outputFormat?: "human" | "json" | "csv" | "xml"
  groupNames?: boolean
  binaryOutput?: boolean
  showAllTags?: boolean
  showCommonTags?: boolean
  specificTags?: string
  geotagsOnly?: boolean
  removeMetadata?: boolean
}

export interface ExifToolResult {
  output: string
  files?: Array<{
    name: string
    content: Buffer
    mimeType: string
    size: number
  }>
}

export async function runExifTool(
  file: Buffer | NodeJS.ReadableStream,
  options: ExifToolOptions = {},
  originalFilename?: string,
): Promise<ExifToolResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME
  if (!container) throw new Error("Docker container name not defined")

  // input to Buffer
  const fileBuffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file)
  const tempName = crypto.randomUUID()
  const hostTempPath = path.join(tmpdir(), tempName)
  const containerPath = `/tmp/${tempName}`

  await fs.writeFile(hostTempPath, fileBuffer)

  try {
    await asyncExecFile("docker", ["cp", hostTempPath, `${container}:${containerPath}`], {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    })

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
      String(options.removeMetadata || false),
    ]

    const { stdout, stderr } = await asyncExecFile("docker", args, {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024, 
    })

    if (
      stderr &&
      !stderr.includes("ExifTool CSV analysis completed") &&
      !stderr.includes("Metadata removed successfully")
    ) {
      console.warn("ExifTool stderr (non-fatal):", stderr)
    }

    const result: ExifToolResult = { output: stdout }
    const files: Array<{ name: string; content: Buffer; mimeType: string; size: number }> = []

    // Handle CSV output
    if (options.outputFormat === "csv") {
      const csvMatch = stdout.match(/CSV_FILE:(.+)/)
      if (csvMatch) {
        const csvPath = csvMatch[1].trim()
        try {
          const tempCsvFile = path.join(tmpdir(), `exiftool_${crypto.randomUUID()}.csv`)
          await asyncExecFile("docker", ["cp", `${container}:${csvPath}`, tempCsvFile], {
            timeout: 30000,
          })

          const csvContent = await fs.readFile(tempCsvFile)
          files.push({
            name: `exiftool_${originalFilename || "file"}_metadata.csv`,
            content: csvContent,
            mimeType: "text/csv",
            size: csvContent.length,
          })

          await fs.unlink(tempCsvFile).catch(() => {})
          await asyncExecFile("docker", ["exec", container, "rm", "-f", csvPath]).catch(() => {})
        } catch (fileError) {
          console.warn("Failed to retrieve CSV file:", fileError)
        }
      }
    }

    if (options.removeMetadata) {
      const cleanedMatch = stdout.match(/CLEANED_FILE:(.+)/)
      if (cleanedMatch) {
        const cleanedPath = cleanedMatch[1].trim()
        try {
          const tempCleanedFile = path.join(tmpdir(), `cleaned_${crypto.randomUUID()}`)
          await asyncExecFile("docker", ["cp", `${container}:${cleanedPath}`, tempCleanedFile], {
            timeout: 30000,
          })

          const cleanedContent = await fs.readFile(tempCleanedFile)
          const cleanedFilename = `cleaned_${originalFilename || "image"}`
          files.push({
            name: cleanedFilename,
            content: cleanedContent,
            mimeType: getImageMimeType(cleanedFilename),
            size: cleanedContent.length,
          })
          await fs.unlink(tempCleanedFile).catch(() => {})
          await asyncExecFile("docker", ["exec", container, "rm", "-f", cleanedPath]).catch(() => {})
        } catch (fileError) {
          console.warn("Failed to retrieve cleaned file:", fileError)
        }
      }
    }

    if (files.length > 0) {
      result.files = files
    }

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (
      errorMessage.includes("ExifTool CSV analysis completed") ||
      errorMessage.includes("Metadata removed successfully")
    ) {
      return { output: errorMessage }
    }

    throw new Error(`ExifTool failed: ${errorMessage}`)
  } finally {
    await Promise.all([
      fs.unlink(hostTempPath).catch(() => {}),
      asyncExecFile("docker", ["exec", container, "rm", "-f", containerPath]).catch(() => {}),
    ])
  }
}
