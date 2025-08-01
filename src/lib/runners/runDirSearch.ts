import { exec } from "child_process"
import util from "util"

const asyncExec = util.promisify(exec)

type Wordlist = "common" | "big" | "mega" | "kali-standard" | "kali-large"

interface DirsearchResult {
  success: boolean
  data?: {
    stdout: string
    stderr: string
  }
  error?: string
}

export async function runDirSearch(
  url: string,
  wordlist: Wordlist,
  threads: number,
  extensions: string,
  recursive: boolean,
  followRedirects: boolean,
): Promise<DirsearchResult> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME || "pwntools"

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

  console.log("DEBUG: Executing Dirsearch with args:", args.join(" "));

  try {
    const { stdout, stderr } = await asyncExec(
      `docker exec ${container} /docker/scripts/run-dirsearch.sh ${args.join(" ")}`,
      {
        maxBuffer: 1024 * 1024 * 10,
      },
    )

    console.log("DEBUG: Dirsearch stdout:", stdout)
    console.log("DEBUG: Dirsearch stderr:", stderr)

    return {
      success: true,
      data: {
        stdout,
        stderr,
      },
    }
  } catch (error) {
    console.error("DEBUG: Dirsearch error:", error)
    const err = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: err,
    }
  }
}
