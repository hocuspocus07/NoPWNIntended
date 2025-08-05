"use client"

import { useState, useCallback } from "react"

export interface ToolExecutionData {
  tool: string
  command: string
  parameters?: Record<string, any>
  target?: string
  results_summary?: string
}

export function useToolTracking() {
  const [isTracking, setIsTracking] = useState(false)

  const startExecution = useCallback(async (executionData: ToolExecutionData): Promise<string> => {
    setIsTracking(true)

    try {
      const response = await fetch("/api/execution/add-execution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(executionData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to start execution tracking")
      }

      const data = await response.json()
      return data.execution_id
    } catch (error) {
      console.error("Error starting execution tracking:", error)
      throw error
    } finally {
      setIsTracking(false)
    }
  }, [])

  const updateExecution = useCallback(async (executionId: string, updates: any): Promise<void> => {
    try {
      const response = await fetch("/api/execution/update-execution", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          execution_id: executionId,
          ...updates,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update execution")
      }
    } catch (error) {
      console.error("Error updating execution:", error)
      throw error
    }
  }, [])

  const completeExecution = useCallback(
    async (
      executionId: string,
      output: string,
      duration: number,
      status: "completed" | "failed" = "completed",
      errorMessage?: string,
    ): Promise<void> => {
      await updateExecution(executionId, {
        output,
        duration: Math.round(duration / 1000), // Convert milliseconds to seconds
        status,
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
    },
    [updateExecution],
  )

  return {
    startExecution,
    updateExecution,
    completeExecution,
    isTracking,
  }
}
