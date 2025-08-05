import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { updateExecution } from "@/utils/storage-helpers/execution-helpers"

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { execution_id, ...updates } = body

    await updateExecution(execution_id, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating execution:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update execution" },
      { status: 500 },
    )
  }
}
