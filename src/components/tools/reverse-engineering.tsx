"use client"
import { FilePreview } from "../filePreview"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Cpu, Search, Loader2, Upload } from 'lucide-react'
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToolTracking } from "@/hooks/use-tool-tracking"

export function ReverseEngineeringTool({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [tool, setTool] = useState("radare2")
  const [r2Command, setR2Command] = useState("info")
  const [objdumpArgs, setObjdumpArgs] = useState("-d")
  const [gdbCommand, setGdbCommand] = useState("run")
  const [xxdLength, setXxdLength] = useState(256)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reverseTools = [
    { value: "radare2", label: "radare2" },
    { value: "gdb", label: "GDB" },
    { value: "objdump", label: "objdump" },
    { value: "strings", label: "strings" },
    { value: "xxd", label: "xxd" },
  ]
  const r2Commands = [
    { value: "info", label: "Show Info (`ii`/`ij`)" },
    { value: "functions", label: "List Functions (`afl`)" },
    { value: "disasm", label: "Disassemble Entry (`pdf @ entry0`)" },
  ]
  const gdbCommands = [
    { value: "run", label: "Run Program" },
    { value: "break", label: "Set Breakpoint" },
    { value: "info", label: "Show Info" },
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
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }, [])

  useEffect(() => {
    onRegisterScan(async () => {
      if (!file) {
        throw new Error("Please select a file")
      }

      setIsLoading(true)
      setError(null)

      const startTime = Date.now()
      let executionId: string | undefined
      let commandString = `${tool} ${file.name}`

      try {
        const formData = new FormData()
        formData.append("file", file)

        let endpoint = ""
        let parameters: Record<string, any> = {}

        switch (tool) {
          case "radare2":
            endpoint = "/api/misc/reverse/radare2"
            formData.append("mode", r2Command)
            commandString += ` -cmd ${r2Command}`
            parameters = { mode: r2Command }
            break
          case "gdb":
            endpoint = "/api/misc/reverse/gdb"
            formData.append("cmd", gdbCommand)
            commandString += ` -cmd ${gdbCommand}`
            parameters = { cmd: gdbCommand }
            break
          case "objdump":
            endpoint = "/api/misc/reverse/objdump"
            formData.append("args", objdumpArgs)
            commandString += ` ${objdumpArgs}`
            parameters = { args: objdumpArgs }
            break
          case "strings":
            endpoint = "/api/misc/reverse/strings"
            break
          case "xxd":
            endpoint = "/api/misc/reverse/xxd"
            formData.append("length", xxdLength.toString())
            commandString += ` -l ${xxdLength}`
            parameters = { length: xxdLength }
            break
        }

        executionId = await startExecution({
          tool: tool,
          command: commandString,
          parameters: parameters,
          target: file.name,
          results_summary: "",
        })

        const response = await fetch(endpoint, {
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

        const data = await response.json()
        const output = data.output || "No output received"

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
  }, [file, tool, r2Command, gdbCommand, objdumpArgs, xxdLength, onRegisterScan, startExecution, completeExecution])


  const showAdvancedOptions = tool === "radare2" || tool === "gdb"

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Reverse Engineering Toolkit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Binary File</Label>
            {file ? (
              <FilePreview file={file} onRemove={() => setFile(null)} />
            ) : (
              <div
                className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-gray-300"
                  }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="mb-2 h-8 w-8 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  Drag & drop a file here, or click to select
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                >
                  Select File
                  <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    accept="application/octet-stream,.bin,.exe,.so,.dll,.elf"
                  />
                </Button>
              </div>
            )}

          </div>
          <div className="space-y-2">
            <Label>Tool</Label>
            <Select value={tool} onValueChange={setTool}>
              <SelectTrigger>
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                {reverseTools.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tool === "radare2" && (
            <div className="space-y-2">
              <Label>radare2 Action</Label>
              <Select value={r2Command} onValueChange={setR2Command}>
                <SelectTrigger>
                  <SelectValue placeholder="r2 Action" />
                </SelectTrigger>
                <SelectContent>
                  {r2Commands.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {tool === "objdump" && (
            <div className="space-y-2">
              <Label htmlFor="objdumpArgs">objdump Args</Label>
              <input
                id="objdumpArgs"
                placeholder="-d, -x, etc."
                value={objdumpArgs}
                onChange={e => setObjdumpArgs(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
          {tool === "gdb" && (
            <div className="space-y-2">
              <Label>GDB Command</Label>
              <Select value={gdbCommand} onValueChange={setGdbCommand}>
                <SelectTrigger>
                  <SelectValue placeholder="GDB command" />
                </SelectTrigger>
                <SelectContent>
                  {gdbCommands.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {tool === "xxd" && (
            <div className="space-y-2">
              <Label htmlFor="xxdLength">Bytes to dump</Label>
              <input
                id="xxdLength"
                type="number"
                min="16"
                max="4096"
                value={xxdLength}
                onChange={e => setXxdLength(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {showAdvancedOptions && (
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
                {/* {tool === "radare2" && (
                  <div className="grid gap-2 text-sm">
                    <div className="font-medium">r2pipe Scripting:</div>
                    <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">const r2 = require('r2pipe');</div>
                    <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">r2.launch(filePath, (err, r2) => {'{'}</div>
                    <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">  r2.cmd('afl', console.log);</div>
                    <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{'}'});</div>
                  </div>
                )} */}
                {tool === "gdb" && (
                  <div className="grid gap-2 text-sm">
                    <div className="font-medium">GDB Automation:</div>
                    <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">gdb --batch -ex "break main" -ex "run" ./program</div>
                    <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">gdb -x script.gdb ./program</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Running {tool}...
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
