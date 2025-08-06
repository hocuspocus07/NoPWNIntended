import { NextResponse } from "next/server"
import { runSherlock } from "@/lib/runners/runSherlock"
import { createClient } from "@/utils/supabase/server" 

export async function POST(req: Request) {
  try {
    const supabase = await createClient() 
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Sherlock API: Authentication required or user not found", userError?.message)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { username, options } = await req.json()

    if (!username) throw new Error("Username is required")

    const output = await runSherlock(username, options)

    return NextResponse.json({ output })
  } catch (err: any) {
    console.error("Sherlock API: Error processing request:", err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
