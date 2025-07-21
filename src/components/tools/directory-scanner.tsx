// components/tools/directory-brute-forcer.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight, FolderSearch } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DirectoryBruteForcer() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [tool, setTool] = useState("ffuf") // Default tool
  const [wordlist, setWordlist] = useState("common")
  const [threads, setThreads] = useState(40)
  const [extensions, setExtensions] = useState("")
  const [recursive, setRecursive] = useState(false)

  const tools = [
    { value: "ffuf", label: "FFUF (Fast)" },
    { value: "gobuster", label: "GoBuster" },
    { value: "dirbuster", label: "DirBuster" },
    { value: "dirsearch", label: "Dirsearch" },
  ]

  const wordlists = [
    { value: "common", label: "Common (2,500 entries)" },
    { value: "big", label: "Big (10,000 entries)" },
    { value: "mega", label: "Mega (50,000 entries)" },
    { value: "Kali-standard", label: "Kali standard" },
    { value: "Kali-large", label: "Kali large" },
  ]

  const handleDirectoryBruteForce = async () => {
    if (!url.trim()) {
      toast("Please enter a URL to scan")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("hi")
      // Generate command based on selected tool
      let command = ""
      switch(tool) {
        case "ffuf":
          command = `ffuf -u ${url}/FUZZ -w ${wordlist}.txt -t ${threads}`
          if (extensions) command += ` -e ${extensions}`
          if (recursive) command += ` -recursion`
          break
        case "gobuster":
          command = `gobuster dir -u ${url} -w ${wordlist}.txt -t ${threads}`
          if (extensions) command += ` -x ${extensions}`
          break
        case "dirbuster":
          command = `dirbuster -u ${url} -l ${wordlist} -t ${threads}`
          if (extensions) command += ` -e ${extensions}`
          break
        case "dirsearch":
          command = `dirsearch -u ${url} -w ${wordlist}.txt -t ${threads}`
          if (extensions) command += ` -e ${extensions}`
          if (recursive) command += ` -r`
          break
      }
      console.log(command)
    } catch (err) {
      setError("Failed to perform directory brute force")
      toast("Failed to complete scan")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

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
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Brute Force Tool</Label>
            <Select value={tool} onValueChange={setTool}>
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
            <Select value={wordlist} onValueChange={setWordlist}>
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
          
          {/* {wordlist === "custom" && (
            <div className="space-y-2">
              <Label>Custom Wordlist Path</Label>
              <Input
                placeholder="/path/to/wordlist.txt"
                onChange={(e) => setWordlist(e.target.value)}
              />
            </div>
          )} */}
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
                <div className="space-y-2">
                  <Label htmlFor="threads">Threads</Label>
                  <Input
                    id="threads"
                    type="number"
                    min="1"
                    max="100"
                    value={threads}
                    onChange={(e) => setThreads(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="extensions">File Extensions (comma-separated)</Label>
                  <Input
                    id="extensions"
                    placeholder="php,html,js"
                    value={extensions}
                    onChange={(e) => setExtensions(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recursive"
                    checked={recursive}
                    onCheckedChange={setRecursive}
                  />
                  <Label htmlFor="recursive">Recursive Scan</Label>
                </div>
                
                {tool === "ffuf" && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="follow-redirects"
                      checked={recursive}
                      onCheckedChange={setRecursive}
                    />
                    <Label htmlFor="follow-redirects">Follow Redirects</Label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}