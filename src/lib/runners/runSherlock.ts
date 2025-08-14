import { execFile } from "child_process"
import util from "util"

const asyncExecFile = util.promisify(execFile)

export interface SherlockOptions {
  timeout?: number
  printFound?: boolean
  printNotFound?: boolean
  csvOutput?: boolean
  jsonOutput?: boolean
  site?: string
  proxy?: string
  tor?: boolean
  uniqueTor?: boolean
}

export async function runSherlock(username: string, options: SherlockOptions = {}): Promise<string> {
  if (!username) throw new Error("Username is required")

  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME
  if (!container) throw new Error("Docker container name not defined")

  try {
    const args = [
      "exec",
      container,
      "/docker/scripts/run-sherlock.sh",
      username,
      String(options.timeout || 60),
      String(options.printFound !== false),
      String(options.printNotFound || false),
      String(options.csvOutput || false),
      String(options.jsonOutput || false),
      options.site || "",
      options.proxy || "",
      String(options.tor || false),
      String(options.uniqueTor || false),
    ]

    const { stdout } = await asyncExecFile("docker", args)
    return stdout
  } catch (error) {
    throw new Error(`Sherlock failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
