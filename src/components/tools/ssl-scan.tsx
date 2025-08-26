"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"
import { ansiToHtml } from "@/utils/ansi"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function SslScanner({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
const { startExecution, completeExecution } = useToolTracking()
const [target, setTarget] = useState("")
const [options, setOptions] = useState({
  startTls: "none" as "none" | "smtp" | "ftp" | "imap" | "pop3" | "ldap",
  scanOpts: {
    showCertificates: false,
    checkHeartbleed: true,
    checkCompression: true,
    checkFallback: true,
    showSigs: false
  }
})
const [advancedOpen, setAdvancedOpen] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  onRegisterScan(async () => {
    if (!target.trim()) {
      throw new Error("Please enter a target host:port")
    }

    setIsLoading(true)
    setError(null)

    const startTime = Date.now()
    let executionId: string | undefined

    try {
      let commandString = `sslscan ${target}`
      if (options.startTls !== "none") commandString += ` --starttls=${options.startTls}`
      if (options.scanOpts.showCertificates) commandString += ` -S`
      if (options.scanOpts.checkHeartbleed) commandString += ` -H`
      if (options.scanOpts.checkCompression) commandString += ` -C`
      if (options.scanOpts.checkFallback) commandString += ` -Z`

      executionId = await startExecution({
        tool: "SSLScan",
        command: commandString,
        parameters: { target, ...options },
        target: target,
        results_summary: "",
      })

      const response = await fetch("/api/vuln-assessment/ssl-analyser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
          startTls: options.startTls,
          scanOpts: {
            certs: options.scanOpts.showCertificates,
            heartbleed: options.scanOpts.checkHeartbleed,
            compression: options.scanOpts.checkCompression,
            fallback: options.scanOpts.checkFallback,
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
      const output = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)

      if (executionId) {
        await completeExecution(executionId, output, duration, "completed", "")
      }

      // Return a wrapper the OutputPanel detects as visual; keep raw too
      setIsLoading(false)
      return JSON.stringify({ tool: "SSLScan", output });
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
}, [target, options, onRegisterScan, startExecution, completeExecution])

const startTlsProtocols = [
  { value: "none", label: "None" },
  { value: "smtp", label: "SMTP" },
  { value: "ftp", label: "FTP" },
  { value: "imap", label: "IMAP" },
  { value: "pop3", label: "POP3" },
  { value: "ldap", label: "LDAP" }
]


const handleScanOptionChange = (option: keyof typeof options.scanOpts) => {
  setOptions(prev => ({
    ...prev,
    scanOpts: {
      ...prev.scanOpts,
      [option]: !prev.scanOpts[option]
    }
  }))
}

return (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        SSL/TLS Scanner
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="target">Target (host:port)</Label>
          <Input
            id="target"
            placeholder="example.com:443"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>STARTTLS Protocol</Label>
          <Select 
            value={options.startTls} 
            onValueChange={(value) => setOptions({
              ...options,
              startTls: value as typeof options.startTls
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select protocol" />
            </SelectTrigger>
            <SelectContent>
              {startTlsProtocols.map((protocol) => (
                <SelectItem key={protocol.value} value={protocol.value}>
                  {protocol.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="rounded-md border p-4 space-y-4">
            
            <div className="space-y-2">
              <Label>Scan Options</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-certs"
                    checked={options.scanOpts.showCertificates}
                    onCheckedChange={() => handleScanOptionChange("showCertificates")}
                  />
                  <Label htmlFor="show-certs">Show Certificates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="heartbleed"
                    checked={options.scanOpts.checkHeartbleed}
                    onCheckedChange={() => handleScanOptionChange("checkHeartbleed")}
                  />
                  <Label htmlFor="heartbleed">Check Heartbleed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compression"
                    checked={options.scanOpts.checkCompression}
                    onCheckedChange={() => handleScanOptionChange("checkCompression")}
                  />
                  <Label htmlFor="compression">Check Compression</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fallback"
                    checked={options.scanOpts.checkFallback}
                    onCheckedChange={() => handleScanOptionChange("checkFallback")}
                  />
                  <Label htmlFor="fallback">Check Fallback</Label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" />
          Running SSL/TLS scan...
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
