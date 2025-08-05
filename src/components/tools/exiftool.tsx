"use client"
import { FilePreview } from "../filePreview"
import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { File, Loader2, ChevronDown, ChevronRight, ImageIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function ExifTool({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [options, setOptions] = useState({
    outputFormat: "human",
    groupNames: false,
    binary: false,
    all: false,
    common: true,
    specificTags: "",
    geotag: false,
    removeMetadata: false,
  })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const outputFormats = [
    { value: "human", label: "Human-readable" },
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "xml", label: "XML" },
  ]

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
      if (!file) throw new Error("Please select a file")
      setIsLoading(true)
      setError(null)

      const startTime = Date.now()
      let executionId: string | undefined

      try {
        let commandString = `exiftool -q -fast`

        if (options.outputFormat === "json") {
          commandString += ` -json`
        } else if (options.outputFormat === "csv") {
          commandString += ` -csv`
        } else if (options.outputFormat === "xml") {
          commandString += ` -xml`
        }

        if (options.groupNames) {
          commandString += ` -g`
        }
        if (options.binary) {
          commandString += ` -b`
        }
        if (options.all) {
          commandString += ` -a`
        }
        if (options.specificTags) {
          const tags = options.specificTags
            .split(",")
            .map((tag) => `-${tag.trim()}`)
            .join(" ")
          commandString += ` ${tags}`
        }
        if (options.geotag) {
          commandString += ` -geotags`
        }
        if (options.removeMetadata) {
          commandString += ` -all=` 
        }
        commandString += ` "${file?.name || "input_file"}"`

        executionId = await startExecution({
          tool: "ExifTool",
          command: commandString, 
          parameters: options,
          target: file?.name || "unknown",
          results_summary: "",
        })

        const formData = new FormData()
        formData.append("file", file)
        formData.append("outputFormat", options.outputFormat)
        formData.append("groupNames", String(options.groupNames))
        formData.append("binaryOutput", String(options.binary))
        formData.append("showAllTags", String(options.all))
        formData.append("showCommonTags", String(options.common))
        formData.append("specificTags", options.specificTags)
        formData.append("geotagsOnly", String(options.geotag))
        formData.append("removeMetadata", String(options.removeMetadata))

        const response = await fetch("/api/osint/exiftool", {
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
        const output = typeof result.output === "string" ? result.output : JSON.stringify(result.output, null, 2)

        // Complete (success)
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
          <ImageIcon className="h-5 w-5" />
          Metadata Analysis (ExifTool)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>File</Label>
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
                <p className="mb-2 text-sm text-gray-500">Drag & drop a file here, or click to select</p>
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  Select File
                  <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={options.outputFormat}
                onValueChange={(value) => setOptions({ ...options, outputFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {outputFormats.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specific-tags">Specific Tags</Label>
              <input
                id="specific-tags"
                placeholder="EXIF:Model,IPTC:Keywords"
                value={options.specificTags}
                onChange={(e) => setOptions({ ...options, specificTags: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="group-names"
                    checked={options.groupNames}
                    onChange={(e) => setOptions({ ...options, groupNames: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="group-names">Show group names</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="binary"
                    checked={options.binary}
                    onChange={(e) => setOptions({ ...options, binary: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="binary">Binary output</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="all"
                    checked={options.all}
                    onChange={(e) => setOptions({ ...options, all: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="all">Show all tags</Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="common"
                    checked={options.common}
                    onChange={(e) => setOptions({ ...options, common: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="common">Show common tags</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="geotag"
                    checked={options.geotag}
                    onChange={(e) => setOptions({ ...options, geotag: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="geotag">Extract geotags only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remove-metadata"
                    checked={options.removeMetadata}
                    onChange={(e) => setOptions({ ...options, removeMetadata: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remove-metadata">Remove all metadata</Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Running ExifTool...
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
