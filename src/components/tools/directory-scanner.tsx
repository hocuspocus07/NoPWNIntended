"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronRight, FolderSearch, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToolTracking } from "@/hooks/use-tool-tracking"

interface ScanProgress {
  current: number
  total: number
  percentage: number
}

export function DirectoryBruteForcer({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking() 
  const [url, setUrl] = useState("")
  const [options, setOptions] = useState({
    tool: "ffuf" as "ffuf" | "gobuster" | "dirsearch",
    wordlist: "common" as "common" | "big" | "mega" | "kali-standard" | "kali-large",
    threads: 40,
    extensions: "",
    recursive: false,
    followRedirects: false,
  })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<ScanProgress | null>(null)

  useEffect(() => {
    onRegisterScan(async () => {
      if (!url.trim()) {
        throw new Error("Please enter a URL to scan")
      }

      if (!url.match(/^https?:\/\/.+/i)) {
        throw new Error("Invalid URL format. Must start with http:// or https://")
      }

      setIsLoading(true)
      setError(null)
      setProgress(null)

      const startTime = Date.now()
      let executionId: string | undefined
      let commandString = `${options.tool} -u ${url}/FUZZ -w ${options.wordlist}`
      const parameters: Record<string, any> = { url, ...options }

      if (options.threads !== 40) commandString += ` -t ${options.threads}`
      if (options.extensions) commandString += ` -e ${options.extensions}`
      if (options.recursive) commandString += ` -recursion`
      if (options.followRedirects) commandString += ` -r`

      try {
        executionId = await startExecution({
          tool: `Directory Brute Force (${options.tool.toUpperCase()})`,
          command: commandString,
          parameters: parameters,
          target: url,
          results_summary: "",
        })

        const endpoint = `/api/exploitation/directory-brute/${options.tool}`
        const body = {
          url,
          wordlist: options.wordlist,
          threads: options.threads,
          extensions: options.extensions,
          recursive: options.recursive,
          followRedirects: options.followRedirects,
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
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

  const tools = [
    { value: "ffuf", label: "FFUF (Fast)" },
    { value: "gobuster", label: "GoBuster" },
    { value: "dirsearch", label: "Dirsearch" },
  ]

  const wordlists = [
    { value: "common", label: "Common (2,500 entries)" },
    { value: "big", label: "Big (10,000 entries)" },
    { value: "mega", label: "Mega (50,000 entries)" },
    { value: "kali-standard", label: "Kali standard" },
    { value: "kali-large", label: "Kali large" },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderSearch className="h-5 w-5" />
          Directory Brute Forcer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="url">Target URL</Label>
            <Input id="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Brute Force Tool</Label>
            <Select
              value={options.tool}
              onValueChange={(value) =>
                setOptions({
                  ...options,
                  tool: value as typeof options.tool,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                {tools.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Wordlist</Label>
            <Select
              value={options.wordlist}
              onValueChange={(value) =>
                setOptions({
                  ...options,
                  wordlist: value as typeof options.wordlist,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select wordlist" />
              </SelectTrigger>
              <SelectContent>
                {wordlists.map((list) => (
                  <SelectItem key={list.value} value={list.value}>
                    {list.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Scanning progress</span>
              <span>
                {progress.current}/{progress.total} ({progress.percentage}%)
              </span>
            </div>
            <Progress value={progress.percentage} className="w-full" />
          </div>
        )}

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
                  <Label htmlFor="threads">Threads</Label>
                  <Input
                    id="threads"
                    type="number"
                    min="1"
                    max="100"
                    value={options.threads}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        threads: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extensions">File Extensions (comma-separated)</Label>
                  <Input
                    id="extensions"
                    placeholder="php,html,js"
                    value={options.extensions}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        extensions: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="recursive"
                    checked={options.recursive}
                    onCheckedChange={(checked) =>
                      setOptions({
                        ...options,
                        recursive: checked,
                      })
                    }
                  />
                  <Label htmlFor="recursive">Recursive Scan</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="follow-redirects"
                    checked={options.followRedirects}
                    onCheckedChange={(checked) =>
                      setOptions({
                        ...options,
                        followRedirects: checked,
                      })
                    }
                  />
                  <Label htmlFor="follow-redirects">Follow Redirects</Label>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-4 w-4" />
            Running {options.tool} scan...
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
