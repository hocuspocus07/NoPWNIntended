import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { getExecutionHistory } from "@/utils/storage-helpers/execution-helpers"

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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const history = await getExecutionHistory(user.id, limit)

    return NextResponse.json({ data: history })
  } catch (error) {
    console.error("Error fetching execution history:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch history" },
      { status: 500 },
    )
  }
}
