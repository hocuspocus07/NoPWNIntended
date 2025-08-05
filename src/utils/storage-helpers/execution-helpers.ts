import { createClient } from "@/utils/supabase/server"

export interface ToolExecution {
  id: string
  user_id: string
  tool_id: string
  command_ran: string
  started_at: string
  ended_at?: string
  status: "running" | "completed" | "failed" | "stopped"
  duration_seconds?: number
  created_at: string
}

export interface ToolUsage {
  id: string
  tool_name: string
  command_ran: string
  started_at: string
  duration: string
  status: "running" | "completed" | "failed" | "stopped"
  output: string
}

export interface UsageStats {
  total_scans: number
  vulnerabilities_found: number
  avg_scan_time: number
  active_scans: number
  tool_distribution: Array<{ name: string; value: number }>
  monthly_activity: Array<{ month: string; scans: number }>
}

export async function addExecution(executionData: {
  user_id: string
  tool: string
  command: string
  parameters: Record<string, any>
  timestamp: string
  duration: number
  status: string
  output: string
  error_message?: string
  target?: string
  results_summary?: string
}): Promise<string> {
  const supabase = await createClient()

  // First, get or create the tool
  let { data: tool, error: toolError } = await supabase
    .from("tools")
    .select("id")
    .eq("name", executionData.tool)
    .single()

  if (toolError || !tool) {
    // Create the tool if it doesn't exist
    const { data: newTool, error: createToolError } = await supabase
      .from("tools")
      .insert({
        name: executionData.tool,
        category: "osint", // Default category
        description: `${executionData.tool} tool`,
      })
      .select("id")
      .single()

    if (createToolError) {
      console.error("Error creating tool:", createToolError.message) // Log message only
      throw new Error(`Failed to create tool: ${createToolError.message}`)
    }
    tool = newTool
  }

  // Insert the execution
  const { data, error } = await supabase
    .from("executions")
    .insert({
      user_id: executionData.user_id,
      tool_id: tool.id,
      command_ran: executionData.command,
      started_at: executionData.timestamp,
      ended_at:
        executionData.status === "completed" || executionData.status === "failed" ? new Date().toISOString() : null,
      status: executionData.status === "pending" ? "running" : executionData.status,
      duration_seconds: executionData.duration,
    })
    .select("id")
    .single()

  if (error) {
    console.error("Error adding execution:", error.message) // Log message only
    throw new Error(`Failed to add execution: ${error.message}`)
  }

  // Store the output in execution_outputs table
  // Use upsert with onConflict to handle cases where output might be added later
  const { error: outputError } = await supabase.from("execution_outputs").upsert(
    {
      execution_id: data.id,
      stdout: executionData.output,
      stderr: executionData.error_message || "",
    },
    { onConflict: "execution_id" },
  )

  if (outputError) {
    console.error("Error storing execution output:", outputError.message) // Log message only
    // Don't throw here, as the execution was created successfully
  }

  return data.id
}

export async function updateExecution(
  id: string,
  updates: {
    output?: string
    duration?: number
    status?: string
    error_message?: string
    updated_at?: string
  },
): Promise<void> {
  const supabase = await createClient()

  // Update the execution
  const executionUpdates: any = {}

  if (updates.status) {
    executionUpdates.status = updates.status === "pending" ? "running" : updates.status
  }

  if (updates.duration !== undefined) {
    executionUpdates.duration_seconds = updates.duration
  }

  if (updates.status === "completed" || updates.status === "failed") {
    executionUpdates.ended_at = new Date().toISOString()
  }

  const { error } = await supabase.from("executions").update(executionUpdates).eq("id", id)

  if (error) {
    console.error("Error updating execution:", error.message) // Log message only
    throw new Error(`Failed to update execution: ${error.message}`)
  }

  // Update the output if provided
  if (updates.output !== undefined) {
    const { error: outputError } = await supabase.from("execution_outputs").upsert(
      {
        execution_id: id,
        stdout: updates.output,
        stderr: updates.error_message || "",
      },
      { onConflict: "execution_id" },
    )

    if (outputError) {
      console.error("Error updating execution output:", outputError.message) // Log message only
    }
  }
}

export async function getExecutionHistory(userId: string, limit = 50): Promise<ToolUsage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);
console.log(data,"here it is");
  if (error) {
    console.error("Error fetching execution history:", error.message);
    throw new Error(`Failed to fetch execution history: ${error.message}`);
  }

  // Convert to plain objects before returning
  const plainData = JSON.parse(JSON.stringify(data || []));

  return plainData.map((execution: any) => ({
    id: execution.id,
    tool_name: execution.tools?.name || "Unknown",
    command_ran: execution.command_ran,
    started_at: execution.started_at, // Already a string from Supabase
duration: `${formatDuration(execution.duration_seconds || 0)}`,
    status: execution.status,
    output: execution.execution_outputs?.stdout || "",
  }));
}
export async function getUsageStats(userId: string): Promise<UsageStats> {
  const supabase = await createClient()

  // Get total scans
  const { count: totalScans, error: totalScansError } = await supabase
    .from("executions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
  if (totalScansError) console.error("Error fetching total scans:", totalScansError.message)

  // Get completed scans
  const { data: completedScans, error: completedScansError } = await supabase
    .from("executions")
    .select(
      `
      duration_seconds,
      execution_outputs (
        stdout
      )
    `,
    )
    .eq("user_id", userId)
    .eq("status", "completed")
  if (completedScansError) console.error("Error fetching completed scans:", completedScansError.message)

  // Get active scans
  const { count: activeScans, error: activeScansError } = await supabase
    .from("executions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "running")
  if (activeScansError) console.error("Error fetching active scans:", activeScansError.message)

  // Get tool distribution
  const { data: toolDistribution, error: toolDistributionError } = await supabase
    .from("executions")
    .select(
      `
      tools (
        name
      )
    `,
    )
    .eq("user_id", userId)
  if (toolDistributionError) console.error("Error fetching tool distribution:", toolDistributionError.message)

  // Calculate tool distribution
  const toolCounts =
    toolDistribution?.reduce(
      (acc: Record<string, number>, execution: any) => {
        const toolName = execution.tools?.name || "Unknown"
        acc[toolName] = (acc[toolName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const toolDistributionArray = Object.entries(toolCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // Calculate average scan time
  const avgScanTime = completedScans?.length
    ? completedScans.reduce((sum: number, scan: any) => sum + (scan.duration_seconds || 0), 0) / completedScans.length
    : 0

  // Count vulnerabilities (simple heuristic based on output content)
  const vulnerabilitiesFound =
    completedScans?.filter((scan: any) => {
      const output = scan.execution_outputs?.stdout?.toLowerCase() || ""
      return (
        output.includes("vulnerability") ||
        output.includes("vuln") ||
        output.includes("critical") ||
        output.includes("high") ||
        output.includes("medium")
      )
    }).length || 0

  // Get monthly activity (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: monthlyData, error: monthlyDataError } = await supabase
    .from("executions")
    .select(
      `
      started_at,
      execution_outputs (
        stdout
      )
    `,
    )
    .eq("user_id", userId)
    .gte("started_at", sixMonthsAgo.toISOString())
  if (monthlyDataError) console.error("Error fetching monthly data:", monthlyDataError.message)

  const monthlyActivity = generateMonthlyActivity(monthlyData || [])

  return {
    total_scans: totalScans || 0,
    vulnerabilities_found: vulnerabilitiesFound,
    avg_scan_time: avgScanTime,
    active_scans: activeScans || 0,
    tool_distribution: toolDistributionArray,
    monthly_activity: monthlyActivity,
  }
}

// Helper functions
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

function generateMonthlyActivity(data: any[]): Array<{ month: string; scans: number; vulns: number }> {
  const months: Array<{ month: string; scans: number; vulns: number }> = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      scans: 0,
      vulns: 0,
    })
  }

  data.forEach((execution: any) => {
    const executionDate = new Date(execution.started_at)
    const monthIndex = months.findIndex((m) => {
      const monthDate = new Date(m.month)
      return (
        monthDate.getMonth() === executionDate.getMonth() && monthDate.getFullYear() === executionDate.getFullYear()
      )
    })

    if (monthIndex !== -1) {
      months[monthIndex].scans++
      const output = execution.execution_outputs?.stdout?.toLowerCase() || ""
      if (output.includes("vulnerability") || output.includes("vuln")) {
        months[monthIndex].vulns++
      }
    }
  })

  return months
}
