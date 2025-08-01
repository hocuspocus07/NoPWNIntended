import { exec } from "child_process"
import util from "util"

const asyncExec = util.promisify(exec)

type WordlistPreset = "common" | "big" | "mega" | "kali-standard" | "kali-large" | string

interface GobusterResult {
  success: boolean
  data?: {
    stdout: string
    stderr: string
  }
  error?: string
}

export async function runGoBuster(
  url: string,
  wordlist: WordlistPreset,
  threads: number,
  extensions = "",
  followRedirects = false,
): Promise<GobusterResult> {
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
    extensions.replace(/[^a-zA-Z0-9,]/g, "") || "none",
    String(followRedirects),
  ]

  console.log("DEBUG: Executing Gobuster with args:", args.join(" "));

  try {
    const { stdout, stderr } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-gobuster.sh ${args.join(" ")}`,
      {
        maxBuffer: 1024 * 1024 * 10,
      },
    )

    console.log("DEBUG: Gobuster stdout:", stdout)
    console.log("DEBUG: Gobuster stderr:", stderr)

    return {
      success: true,
      data: {
        stdout,
        stderr,
      },
    }
  } catch (error) {
    console.error("DEBUG: Gobuster error:", error)
    const err = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: err,
    }
  }
}
