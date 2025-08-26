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
): Promise<GobusterResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME || "pwntools"

  // Input validation
  if (!url.match(/^https?:\/\/.+/i)) {
    return {
      success: false,
      error: "Invalid URL format",
    }
  }

  // Clean and validate extensions
  const cleanExtensions = extensions.replace(/[^a-zA-Z0-9,]/g, "") || "none"
  
  const args = [
    url,
    wordlist,
    Math.max(1, Math.min(threads, 100)).toString(),
    cleanExtensions,
  ]

  console.log("DEBUG: Executing Gobuster with args:", args.join(" "));
  console.log("DEBUG: Extensions parameter:", cleanExtensions);

  try {
    const dockerCommand = `docker exec ${container} /docker/scripts/run-gobuster.sh ${args.join(" ")}`
    console.log("DEBUG: Docker command:", dockerCommand);
    
    const { stdout, stderr } = await asyncExec(
      dockerCommand,
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
