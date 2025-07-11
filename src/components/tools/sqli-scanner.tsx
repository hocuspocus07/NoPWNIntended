// components/tools/sqli-nosql-scanner.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight, Database } from "lucide-react"
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

export function SqlInjectionScanner() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [scanType, setScanType] = useState("detection") // detection or exploitation
  const [dbType, setDbType] = useState("sql") // sql or nosql
  const [technique, setTechnique] = useState("boolean") // boolean, time-based, error-based
  const [wordlist, setWordlist] = useState("common")
  const [threads, setThreads] = useState(10)
  const [parameters, setParameters] = useState("id,user,search")
  const [results, setResults] = useState("")

  const dbTypes = [
    { value: "sql", label: "SQL" },
    { value: "nosql", label: "NoSQL" },
  ]

  const scanTypes = [
    { value: "detection", label: "Vulnerability Detection" },
    { value: "exploitation", label: "Exploitation" },
  ]

  const techniques = [
    { value: "boolean", label: "Boolean-based" },
    { value: "time", label: "Time-based" },
    { value: "error", label: "Error-based" },
    { value: "union", label: "UNION-based" },
  ]

  const wordlists = [
    { value: "common", label: "Common payloads" },
    { value: "xss", label: "XSS combo" },
    { value: "fuzzdb", label: "FuzzDB" },
    { value: "custom", label: "Custom path..." },
  ]

  const handleScan = async () => {
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
        result = `[+] Scanning ${url} for ${dbType.toUpperCase()} injection points\n`
        result += `[+] Testing parameters: ${parameters}\n`
        result += "[*] Potential vulnerabilities found:\n"
        result += "- Parameter 'id' appears vulnerable to ${technique} ${dbType.toUpperCase()} injection\n"
        result += "- Parameter 'search' may be vulnerable to NoSQL operator injection\n"
      } else {
        result = `[+] Exploiting ${url} using ${technique} technique\n`
        result += `[+] Using ${wordlist} wordlist with ${threads} threads\n`
        result += "[*] Successful payloads:\n"
        result += "- ' OR 1=1 -- \n"
        result += "- ' || 1==1// \n"
        result += "[+] Extracted data:\n"
        result += "- Database version: MySQL 5.7.32\n"
        result += "- Current user: root@localhost\n"
      }
      
      setResults(result)
      toast(`${scanType === "detection" ? "Scan" : "Exploitation"} completed`)
    } catch (err) {
      setError("Operation failed")
      toast(`Failed to complete ${scanType === "detection" ? "scan" : "exploitation"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {dbType.toUpperCase()} Injection Scanner
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
            <Label>Database Type</Label>
            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger>
                <SelectValue placeholder="Select DB type" />
              </SelectTrigger>
              <SelectContent>
                {dbTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          
          {scanType === "exploitation" && (
            <div className="space-y-2">
              <Label>Injection Technique</Label>
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
                    placeholder="id,user,search"
                    value={parameters}
                    onChange={(e) => setParameters(e.target.value)}
                  />
                </div>
                
                {scanType === "exploitation" && (
                  <>
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
                    
                    {wordlist === "custom" && (
                      <div className="space-y-2">
                        <Label>Custom Wordlist Path</Label>
                        <Input
                          placeholder="/path/to/payloads.txt"
                          onChange={(e) => setWordlist(e.target.value)}
                        />
                      </div>
                    )}
                  </>
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
                
                {dbType === "nosql" && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="blind-attack"
                      checked={technique === "boolean" || technique === "time"}
                      onCheckedChange={(checked) => 
                        setTechnique(checked ? "boolean" : "error")
                      }
                    />
                    <Label htmlFor="blind-attack">Blind Injection</Label>
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