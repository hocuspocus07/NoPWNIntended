import { NextResponse } from "next/server"
import { runWPScan } from "@/lib/runners/runWPScan"
import { createClient } from "@supabase/supabase-js"
import { WPScanRequest } from "@/lib/runners/runWPScan"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : ""
    if (!token) throw new Error("Auth session missing!")

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user) throw new Error(userError?.message || "No user found")

    const { target, scanOpts } = await request.json() as WPScanRequest

    if (!target) throw new Error("Target is required")

    const output = await runWPScan(target, scanOpts)

    return NextResponse.json({ 
      data: output,
      status: "success"
    })
  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message || String(err) 
    }, { 
      status: 500 
    })
  }
}