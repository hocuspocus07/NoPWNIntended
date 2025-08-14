"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function SherlockTool({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking()
  const [username, setUsername] = useState("")
  const [timeout, setTimeout] = useState(60)
  const [printFound, setPrintFound] = useState(true)
  const [printNotFound, setPrintNotFound] = useState(false)
  const [csv, setCsv] = useState(false)
  const [json, setJson] = useState(false)
  const [site, setSite] = useState("")
  const [proxy, setProxy] = useState("")
  const [tor, setTor] = useState(false)
  const [uniqueTor, setUniqueTor] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scanFunctionRef = useRef<() => Promise<string>>(null!)

  const scanFunction = useCallback(async () => {
    if (!username) {
      throw new Error("Please enter a username")
    }

    setIsLoading(true)
    setError(null)

    const startTime = Date.now()
    let executionId: string | undefined

    try {
      let commandString = `sherlock ${username}`
      if (timeout !== 60) commandString += ` --timeout ${timeout}`
      if (!printFound) commandString += ` --print-all`
      if (printFound) commandString += ` --print-found`
      if (csv) commandString += ` --csv`
      if (json) commandString += ` --json`
      if (site) commandString += ` --site ${site}`
      if (proxy) commandString += ` --proxy ${proxy}`
      if (tor) commandString += ` --tor`
      if (uniqueTor) commandString += ` --unique-tor`

      executionId = await startExecution({
        tool: "Sherlock",
        command: commandString,
        parameters: {
          timeout,
          printFound,
          printNotFound,
          csv,
          json,
          site,
          proxy,
          tor,
          uniqueTor,
        },
        target: username,
        results_summary: "",
      })

      const response = await fetch("/api/osint/sherlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          options: {
            timeout,
            printFound,
            printNotFound,
            csv,
            json,
            site,
            proxy,
            tor,
            uniqueTor,
            csvOutput: csv,
            jsonOutput: json,
          },
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
      const output = typeof result.output === "string" ? result.output : JSON.stringify(result.output, null, 2)

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
  }, [
    username,
    timeout,
    printFound,
    printNotFound,
    csv,
    json,
    site,
    proxy,
    tor,
    uniqueTor,
    startExecution,
    completeExecution,
  ])

  // Update the ref with the latest function
  scanFunctionRef.current = scanFunction

  useEffect(() => {
    const stableWrapper = () => {
      if (scanFunctionRef.current) {
        return scanFunctionRef.current()
      }
      throw new Error("Scan function not available")
    }
    onRegisterScan(stableWrapper)
  }, [onRegisterScan])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Username Search (Sherlock)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">Specific Site</Label>
            <Input id="site" placeholder="twitter,github,etc." value={site} onChange={(e) => setSite(e.target.value)} />
          </div>
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
            <div className="rounded-md border p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="print-found" checked={printFound} onCheckedChange={setPrintFound} />
                    <Label htmlFor="print-found">Print found accounts</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="print-not-found" checked={printNotFound} onCheckedChange={setPrintNotFound} />
                    <Label htmlFor="print-not-found">Print not found accounts</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="csv" checked={csv} onCheckedChange={setCsv} />
                    <Label htmlFor="csv">CSV output</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="json" checked={json} onCheckedChange={setJson} />
                    <Label htmlFor="json">JSON output</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="10"
                      max="300"
                      value={timeout}
                      onChange={(e) => setTimeout(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proxy">Proxy (host:port)</Label>
                    <Input
                      id="proxy"
                      placeholder="127.0.0.1:8080"
                      value={proxy}
                      onChange={(e) => setProxy(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="tor" checked={tor} onCheckedChange={setTor} />
                    <Label htmlFor="tor">Use Tor</Label>
                  </div>

                  {tor && (
                    <div className="flex items-center space-x-2">
                      <Switch id="unique-tor" checked={uniqueTor} onCheckedChange={setUniqueTor} />
                      <Label htmlFor="unique-tor">Unique Tor circuit per site</Label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Running Sherlock...
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
