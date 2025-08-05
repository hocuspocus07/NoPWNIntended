import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user from the session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "5") // Default to 5 per page
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Fetch paginated history and total count
    const {
      data: history,
      count,
      error: historyError,
    } = await supabase
      .from("executions")
      .select(
        `
        id,
        command_ran,
        started_at,
        ended_at,
        status,
        duration_seconds,
        tools (
          name
        ),
        execution_outputs (
          stdout
        )
      `,
        { count: "exact" }, // Request exact count
      )
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .range(offset, offset + limit - 1) // Apply range for pagination

    if (historyError) {
      console.error("Error fetching execution history:", historyError.message)
      throw new Error(`Failed to fetch execution history: ${historyError.message}`)
    }

    // Map data to ToolUsage format (assuming getExecutionHistory helper does this)
    // If getExecutionHistory is still used, ensure it handles the raw data from Supabase
    // For simplicity, I'll map it here directly as the API route is the source now.
    const formattedHistory = (history || []).map((execution: any) => ({
      id: execution.id,
      tool_name: execution.tools?.name || "Unknown",
      command_ran: execution.command_ran,
      started_at: execution.started_at,
      duration: formatDuration(execution.duration_seconds || 0), // Assuming formatDuration is available or inlined
      status: execution.status,
      output: execution.execution_outputs?.stdout || "",
    }))

    return NextResponse.json({ data: formattedHistory, totalCount: count })
  } catch (error) {
    console.error("Error fetching execution history:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch history" },
      { status: 500 },
    )
  }
}

// Helper function (ensure this is available in this file or imported)
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}
