import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { addExecution } from "@/utils/storage-helpers/execution-helpers"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("API Route: Error getting user:", userError.message)
      return NextResponse.json({ error: userError.message || "Authentication required" }, { status: 401 })
    }
    if (!user) {
      console.error("API Route: No user found after getUser()")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("API Route: User found:", user.id)

    const body = await request.json()

    const executionId = await addExecution({
      user_id: user.id,
      tool: body.tool,
      command: body.command,
      parameters: body.parameters || {},
      timestamp: new Date().toISOString(),
      duration: 0, // update when completed
      status: "pending",
      output: "",
      target: body.target,
      results_summary: body.results_summary,
    })

    return NextResponse.json({
      success: true,
      execution_id: executionId,
    })
  } catch (error) {
    console.error("API Route: Error adding execution:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add execution" },
      { status: 500 },
    )
  }
}