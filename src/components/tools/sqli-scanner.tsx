"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Database, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function SqlInjectionScanner({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking()
  const [url, setUrl] = useState("")
  const [params, setParams] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [options, setOptions] = useState({
    mode: "detect" as "detect" | "exploit",
    threads: 10,
    risk: "1" as "1" | "2" | "3",
    level: "1" as "1" | "2" | "3" | "4" | "5",
  })

  const modes = [
    { value: "detect", label: "Vulnerability Detection" },
    { value: "exploit", label: "Data Extraction" },
  ]

  const riskLevels = [
    { value: "1", label: "1 - Low Risk" },
    { value: "2", label: "2 - Medium Risk" },
    { value: "3", label: "3 - High Risk" },
  ]

  const testLevels = [
    { value: "1", label: "1 - Basic Tests" },
    { value: "2", label: "2 - Cookie Tests" },
    { value: "3", label: "3 - User-Agent Tests" },
    { value: "4", label: "4 - Referer Tests" },
    { value: "5", label: "5 - Host Tests" },
  ]

  useEffect(() => {
    onRegisterScan(async () => {
      if (!url.trim()) {
        throw new Error("Please enter a target URL")
      }

      if (!url.match(/^https?:\/\/.+/i)) {
        throw new Error("Invalid URL format. Must start with http:// or https://")
      }

      setIsLoading(true)
      setError(null)

      const startTime = Date.now()
      let executionId: string | undefined
      let commandString = `sqlmap -u ${url}`

      if (params) commandString += ` -p ${params}`
      if (options.threads !== 10) commandString += ` --threads=${options.threads}`
      if (options.risk !== "1") commandString += ` --risk=${options.risk}`
      if (options.level !== "1") commandString += ` --level=${options.level}`
      if (options.mode === "exploit") commandString += ` --dump`

      const parameters = {
        url,
        params,
        mode: options.mode,
        threads: options.threads,
        risk: options.risk,
        level: options.level,
      }

      try {
        executionId = await startExecution({
          tool: "SQLMap",
          command: commandString,
          parameters,
          target: url,
          results_summary: "",
        })

        const response = await fetch("/api/exploitation/sqli", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
            params: params.trim(),
            threads: options.threads,
            mode: options.mode,
            risk: options.risk,
            level: options.level,
            executionId,
          }),
        })

        const duration = Date.now() - startTime

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          const apiError = errorData.error || `HTTP ${response.status}: ${response.statusText}`

          if (executionId) {
            await completeExecution(executionId, "", duration, "failed", apiError)
          }
          setIsLoading(false)
          throw new Error(apiError)
        }

        const result = await response.json()
        const output = typeof result.data === "string" ? result.data : JSON.stringify(result.data, null, 2)

        if (executionId) {
          await completeExecution(executionId, output, duration, "completed", "")
        }

        setIsLoading(false)
        return output
      } catch (err) {
        const errorMessage = (err as { message?: string })?.message || "Unknown error"
        if (executionId) {
          await completeExecution(executionId, "", Date.now() - startTime, "failed", errorMessage)
        }
        setIsLoading(false)
        setError(errorMessage)
        throw err
      }
    })
  }, [url, params, options, onRegisterScan, startExecution, completeExecution])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          SQL Injection Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Target URL</Label>
          <Input
            id="url"
            placeholder="http://localhost/vulnerabilities/sqli/?id=1&Submit=Submit"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter a URL with parameters. SQLMap will automatically detect injectable parameters.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Scan Mode</Label>
          <Select
            value={options.mode}
            onValueChange={(value) => setOptions({ ...options, mode: value as "detect" | "exploit" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select scan mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-0"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            {advancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span>Advanced Options</span>
          </Button>

          {advancedOpen && (
            <div className="rounded-md border p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="params">Parameters (comma-separated)</Label>
                  <Input
                    id="params"
                    placeholder="id,user,search"
                    value={params}
                    onChange={(e) => setParams(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Specify parameters to test (e.g., `id,name`). Leave empty for auto-detection.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="threads">Threads</Label>
                  <Input
                    id="threads"
                    type="number"
                    min="1"
                    max="20"
                    value={options.threads}
                    onChange={(e) => setOptions({ ...options, threads: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select
                    value={options.risk}
                    onValueChange={(value) => setOptions({ ...options, risk: value as "1" | "2" | "3" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Level</Label>
                  <Select
                    value={options.level}
                    onValueChange={(value) => setOptions({ ...options, level: value as "1" | "2" | "3" | "4" | "5" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test level" />
                    </SelectTrigger>
                    <SelectContent>
                      {testLevels.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Running SQLMap scan...
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
