// components/tools/xss-tester.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight, Code } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function XssTester() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [scanType, setScanType] = useState("detection") // detection or exploitation
  const [technique, setTechnique] = useState("reflected") // reflected, stored, dom
  const [wordlist, setWordlist] = useState("common")
  const [threads, setThreads] = useState(10)
  const [parameters, setParameters] = useState("search,query,id")
  const [results, setResults] = useState("")

  const scanTypes = [
    { value: "detection", label: "Vulnerability Detection" },
    { value: "exploitation", label: "Payload Testing" },
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

  const handleXssTest = async () => {
    if (!url.trim()) {
      toast("Please enter a target URL")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults("")

    try {
      // Simulate scan/exploitation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let result = ""
      if (scanType === "detection") {
        result = `[+] Scanning ${url} for XSS vulnerabilities\n`
        result += `[+] Testing parameters: ${parameters}\n`
        result += `[+] Technique: ${technique}\n`
        result += "[*] Potential vulnerabilities found:\n"
        result += "- Parameter 'search' appears vulnerable to ${technique} XSS\n"
        result += "- Parameter 'id' may be vulnerable to DOM-based XSS\n"
      } else {
        result = `[+] Testing XSS payloads on ${url}\n`
        result += `[+] Using ${wordlist} wordlist with ${threads} threads\n`
        result += "[*] Successful payloads:\n"
        result += "- <script>alert(1)</script>\n"
        result += "- \" onerror=\"alert(1)\"\n"
        result += "- javascript:alert(document.domain)\n"
        result += "[+] Contexts found:\n"
        result += "- HTML attribute (unquoted)\n"
        result += "- JavaScript string\n"
      }
      
      setResults(result)
      toast(`${scanType === "detection" ? "Scan" : "Testing"} completed`)
    } catch (err) {
      setError("Operation failed")
      toast(`Failed to complete ${scanType === "detection" ? "scan" : "testing"}`)
    } finally {
      setIsLoading(false)
    }
  }

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
            <Select value={scanType} onValueChange={setScanType}>
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
            <Select value={technique} onValueChange={setTechnique}>
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
          
          {scanType === "exploitation" && (
            <div className="space-y-2">
              <Label>Payload Wordlist</Label>
              <Select value={wordlist} onValueChange={setWordlist}>
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
                  <Label htmlFor="parameters">Parameters to Test</Label>
                  <Input
                    id="parameters"
                    placeholder="search,query,id"
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                  />
                </div>
                
                {scanType === "exploitation" && wordlist === "custom" && (
                  <div className="space-y-2">
                    <Label>Custom Wordlist Path</Label>
                    <Input
                      placeholder="/path/to/xss-payloads.txt"
                      onChange={(e) => setWordlist(e.target.value)}
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
                    value={threads}
                    onChange={(e) => setThreads(Number(e.target.value))}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="encode-payloads"
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="encode-payloads">URL-encode payloads</Label>
                </div>
                
                {technique === "dom" && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="event-handlers"
                      checked={true}
                      onCheckedChange={() => {}}
                    />
                    <Label htmlFor="event-handlers">Test event handlers</Label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {results && (
          <div className="space-y-2">
            <Label>Results</Label>
            <Textarea
              readOnly
              value={results}
              className="h-64 font-mono text-sm"
            />
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