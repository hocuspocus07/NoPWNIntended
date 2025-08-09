"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Code, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function XssTester({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking()
  const [url, setUrl] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [options, setOptions] = useState({
    scanType: "detect" as "detect" | "payload",
    technique: "reflected" as "reflected" | "stored" | "dom",
    wordlist: "common" as "common" | "polyglot" | "fuzzdb" | "custom",
    threads: 10,
    encode: true,
    customWordlist: "",
    testEventHandlers: true,
  })

  const scanTypes = [
    { value: "detect", label: "Vulnerability Detection" },
    { value: "payload", label: "Payload Testing" },
  ]

  const techniques = [
    { value: "reflected", label: "Reflected XSS" },
    { value: "stored", label: "Stored XSS" },
    { value: "dom", label: "DOM-based XSS" },
  ]

  const wordlists = [
    { value: "common", label: "Common payloads" },
    { value: "polyglot", label: "Polyglot payloads" },
    { value: "fuzzdb", label: "FuzzDB XSS" },
    { value: "custom", label: "Custom path..." },
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
      let commandString = `xsstrike -u ${url}`

      if (options.threads !== 10) commandString += ` --threads ${options.threads}`
      if (options.scanType === "payload") commandString += ` --payloads`
      if (options.encode) commandString += ` --encode`

      const parameters = {
        url,
        scanType: options.scanType,
        technique: options.technique,
        wordlist: options.wordlist,
        threads: options.threads,
        encode: options.encode,
        testEventHandlers: options.testEventHandlers,
      }

      try {
        executionId = await startExecution({
          tool: "XSStrike",
          command: commandString,
          parameters,
          target: url,
          results_summary: "",
        })

        const response = await fetch("/api/exploitation/xss", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
            threads: options.threads,
            scanOpts: {
              scanType: options.scanType,
              encode: options.encode,
            },
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
  }, [url, options, onRegisterScan, startExecution, completeExecution])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          XSS Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="url">Target URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/search?q=test"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Scan Type</Label>
            <Select
              value={options.scanType}
              onValueChange={(value) => setOptions({ ...options, scanType: value as "detect" | "payload" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select scan type" />
              </SelectTrigger>
              <SelectContent>
                {scanTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>XSS Technique</Label>
            <Select
              value={options.technique}
              onValueChange={(value) => setOptions({ ...options, technique: value as "reflected" | "stored" | "dom" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select technique" />
              </SelectTrigger>
              <SelectContent>
                {techniques.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {options.scanType === "payload" && (
            <div className="space-y-2">
              <Label>Payload Wordlist</Label>
              <Select
                value={options.wordlist}
                onValueChange={(value) =>
                  setOptions({ ...options, wordlist: value as "common" | "polyglot" | "fuzzdb" | "custom" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select wordlist" />
                </SelectTrigger>
                <SelectContent>
                  {wordlists.map((w) => (
                    <SelectItem key={w.value} value={w.value}>
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
                {options.scanType === "payload" && options.wordlist === "custom" && (
                  <div className="space-y-2">
                    <Label>Custom Wordlist Path</Label>
                    <Input
                      placeholder="/path/to/xss-payloads.txt"
                      value={options.customWordlist}
                      onChange={(e) => setOptions({ ...options, customWordlist: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="threads">Threads</Label>
                  <Input
                    id="threads"
                    type="number"
                    min="1"
                    max="50"
                    value={options.threads}
                    onChange={(e) => setOptions({ ...options, threads: Number(e.target.value) })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="encode-payloads"
                    checked={options.encode}
                    onCheckedChange={(checked) => setOptions({ ...options, encode: checked })}
                  />
                  <Label htmlFor="encode-payloads">URL-encode payloads</Label>
                </div>

                {options.technique === "dom" && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="event-handlers"
                      checked={options.testEventHandlers}
                      onCheckedChange={(checked) => setOptions({ ...options, testEventHandlers: checked })}
                    />
                    <Label htmlFor="event-handlers">Test event handlers</Label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Running XSStrike scan...
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
