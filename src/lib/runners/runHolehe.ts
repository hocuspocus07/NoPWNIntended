import { execFile } from "child_process"
import util from "util"

const asyncExecFile = util.promisify(execFile)

export interface HoleheOptions {
  onlyUsed?: boolean
  verbose?: boolean
  timeout?: number
  exclude?: string
  outputFormat?: "text" | "json" | "csv"
}

export async function runHolehe(email: string, options: HoleheOptions = {}): Promise<string> {
  if (!email) throw new Error("Email is required")

  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME
  if (!container) throw new Error("Docker container name not defined")

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
      options.outputFormat || "text",
    ]

    const { stdout, stderr } = await asyncExecFile("docker", args, {
      timeout: 60000,
      maxBuffer: 1024 * 1024 * 10, 
    })
    if (options.outputFormat === "csv") {
      if (!stdout || stdout.trim().length === 0) {
        throw new Error("No CSV output received from holehe")
      }
      return stdout.trim()
    }

    return stdout
  } catch (error: any) {
    if (error.code === "ETIMEDOUT") {
      throw new Error("Holehe command timed out. Try reducing the timeout value or check your network connection.")
    }

    // If stderr contains progress bars but stdout has content, it's likely successful
    if (error.stdout && error.stdout.includes("results.csv")) {
      return error.stdout
    }

    const errorMessage = error.stderr || error.message || String(error)
    throw new Error(`Holehe failed: ${errorMessage}`)
  }
}
