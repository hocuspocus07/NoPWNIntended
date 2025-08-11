"use client"

import { FilePreview } from "../filePreview"
import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { File, Loader2, ChevronDown, ChevronRight, Network } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function PcapAnalyzer({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [options, setOptions] = useState({
    extractCredentials: true,
    extractFlags: true,
    filterExpression: "",
    showRawPackets: false,
  })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }, [])

  useEffect(() => {
    onRegisterScan(async () => {
      if (!file) throw new Error("Please select a PCAP file to analyze.")
      setIsLoading(true)
      setError(null)

      const startTime = Date.now()
      let executionId: string | undefined

      try {
        let commandString = `tshark -r "${file?.name || "input.pcap"}"`
        if (options.filterExpression) {
          commandString += ` -Y "${options.filterExpression}"`
        }
        commandString += ` --extract-credentials=${options.extractCredentials} --extract-flags=${options.extractFlags}`

        executionId = await startExecution({
          tool: "PCAP Analyzer",
          command: commandString,
          parameters: options,
          target: file?.name || "unknown.pcap",
          results_summary: "",
        })

        const formData = new FormData()
        formData.append("file", file)
        formData.append("extractCredentials", String(options.extractCredentials))
        formData.append("extractFlags", String(options.extractFlags))
        formData.append("filterExpression", options.filterExpression)
        formData.append("showRawPackets", String(options.showRawPackets))

        const response = await fetch("/api/pcap", {
          method: "POST",
          body: formData,
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
        console.log(result);
        const output = JSON.stringify(result, null, 2) // always stringified JSON

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
  }, [file, options, onRegisterScan, startExecution, completeExecution])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          PCAP Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>PCAP File</Label>
            {file ? (
              <FilePreview file={file} onRemove={() => setFile(null)} />
            ) : (
              <div
                className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${
                  isDragging ? "border-primary bg-primary/10" : "border-gray-300"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <File className="mb-2 h-8 w-8 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">Drag & drop a .pcap/.pcapng file here, or click to select</p>
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  Select File
                  <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    accept=".pcap,.pcapng"
                  />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="extract-credentials"
                checked={options.extractCredentials}
                onCheckedChange={(checked) => setOptions({ ...options, extractCredentials: checked })}
              />
              <Label htmlFor="extract-credentials">Extract Credentials</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="extract-flags"
                checked={options.extractFlags}
                onCheckedChange={(checked) => setOptions({ ...options, extractFlags: checked })}
              />
              <Label htmlFor="extract-flags">Extract CTF Flags</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-expression">Wireshark Filter (e.g., tcp.port == 80)</Label>
              <Input
                id="filter-expression"
                placeholder="tcp.port == 80 or http.request"
                value={options.filterExpression}
                onChange={(e) => setOptions({ ...options, filterExpression: e.target.value })}
              />
            </div>
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
            <div className="rounded-md border p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-raw-packets"
                  checked={options.showRawPackets}
                  onCheckedChange={(checked) => setOptions({ ...options, showRawPackets: checked })}
                />
                <Label htmlFor="show-raw-packets">Show Raw Packet Data</Label>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Analyzing PCAP...
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
