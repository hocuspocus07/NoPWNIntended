import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUsageStats } from "@/utils/storage-helpers/execution-helpers"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user from the session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("API: usage-stats - Authentication required or user not found:", userError?.message)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    console.log("API: usage-stats - User authenticated:", user.id)

    const stats = await getUsageStats(user.id)
    console.log("API: usage-stats - Fetched usage stats:", JSON.stringify(stats, null, 2))

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error("API: usage-stats - Error fetching usage stats:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch usage stats" },
      { status: 500 },
    )
  }
}
