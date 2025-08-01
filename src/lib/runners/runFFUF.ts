import { exec } from "child_process"
import util from "util"

const asyncExec = util.promisify(exec)

interface FFUFResult {
  success: boolean
  data?: any
  error?: string
}

export async function runFFUF(
  url: string,
  wordlist: string,
  threads: number,
  extensions = "",
  recursive = false,
  followRedirects = false,
): Promise<FFUFResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME || "pwntools"

  // Input validation
  if (!url.match(/^https?:\/\/.+/i)) {
    return {
      success: false,
      error: "Invalid URL format",
    }
  }

  const args = [
    url,
    wordlist,
    Math.max(1, Math.min(threads, 100)).toString(),
    extensions.replace(/[^a-zA-Z0-9,]/g, ""),
    String(recursive),
    String(followRedirects),
  ]

  try {
    const { stdout, stderr } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-ffuf.sh ${args.join(" ")}`,
      {
        maxBuffer: 1024 * 1024 * 10,
      },
    )

    const cleanOutput = stdout
      .split("\n")
      .filter((line) => !line.includes("PROGRESS:") && !line.includes("[2K") && !line.match(/^:: Progress:/))
      .join("\n")
      .replace(/\x1b\[[0-9;]*m/g, "") 

    return {
      success: true,
      data: {
        stdout: cleanOutput,
        stderr: stderr,
      },
    }
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: err,
    }
  }
}
