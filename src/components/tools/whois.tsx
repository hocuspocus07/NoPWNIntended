"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function WhoisPanel({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
const { startExecution, completeExecution } = useToolTracking()
const [domain, setDomain] = useState("")
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [advancedOpen, setAdvancedOpen] = useState(false)
const [recursive, setRecursive] = useState(false)
const [rawOutput, setRawOutput] = useState(false)

useEffect(() => {
  onRegisterScan(async () => {
    if (!domain.trim()) {
      throw new Error("Please enter a domain to lookup")
    }

    // Validate domain format
    if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain)) {
      throw new Error("Please enter a valid domain name")
    }

    setIsLoading(true)
    setError(null)

    const startTime = Date.now()
    let executionId: string | undefined
    let commandString = `whois ${domain}`
    let parameters: Record<string, any> = { domain, recursive, rawOutput }

    if (recursive) commandString += ` -r`
    if (rawOutput) commandString += ` -raw`

    try {
      executionId = await startExecution({
        tool: "WHOIS",
        command: commandString,
        parameters: parameters,
        target: domain,
        results_summary: "",
      })

      const response = await fetch("/api/recon/whois", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          scanOpts: {
            recursive,
            rawOutput
          }
        })
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
      let outputString: string;
      if (typeof result.data === 'string') {
        outputString = result.data;
      } else {
        outputString = JSON.stringify(result.data, null, 2);
      }
      if (executionId) {
        await completeExecution(executionId, outputString, duration, "completed", "")
      }

      setIsLoading(false)
      return JSON.stringify({ tool: "WHOIS", output: outputString }); // Return the JSON string
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
}, [domain, recursive, rawOutput, onRegisterScan, startExecution, completeExecution])

return (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        WHOIS Lookup
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="domain">Domain Name</Label>
          <Input
            id="domain"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-0"
          onClick={() => setAdvancedOpen(!advancedOpen)}
        >
          {advancedOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>Advanced Options</span>
        </Button>
        
        {advancedOpen && (
          <div className="rounded-md border p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recursive"
                  checked={recursive}
                  onCheckedChange={setRecursive}
                />
                <Label htmlFor="recursive">Recursive Lookup</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="raw-output"
                  checked={rawOutput}
                  onCheckedChange={setRawOutput}
                />
                <Label htmlFor="raw-output">Raw Output</Label>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" />
          Running WHOIS lookup...
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
