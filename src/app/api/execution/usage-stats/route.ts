import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getUsageStats } from "@/utils/storage-helpers/execution-helpers"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const stats = await getUsageStats(user.id)

    return NextResponse.json({ data: stats })
  } catch (error) {
    console.error("Error fetching usage stats:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 },
    )
  }
}
