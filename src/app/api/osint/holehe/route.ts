import { NextResponse } from "next/server"
import { runHolehe } from "@/lib/runners/runHolehe"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Holehe API: Authentication required or user not found", userError?.message)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { email, options } = await req.json()

    if (!email) throw new Error("Email is required")

    if (options?.outputFormat && !["text", "json", "csv"].includes(options.outputFormat)) {
      throw new Error("Invalid output format")
    }

    const output = await runHolehe(email, options)

    if (options?.outputFormat === "csv") {
      const csvContent = output.trim()
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `holehe-${email.replace("@", "_at_")}-${timestamp}.csv`

      return NextResponse.json({
        output: JSON.stringify({
          tool: "Holehe",
          message: `Email breach check completed for ${email}`,
          files: [
            {
              name: filename,
              type: "csv" as const,
              content: csvContent,
              size: new Blob([csvContent]).size,
            },
          ],
        }),
      })
    }

    return NextResponse.json({ output })
  } catch (err: any) {
    console.error("Holehe API: Error processing request:", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
