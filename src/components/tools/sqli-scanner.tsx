"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Database } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SqlInjectionScannerProps {
  onRegisterScan: (scanFn: () => Promise<string>) => void
}

export function SqlInjectionScanner({ onRegisterScan }: SqlInjectionScannerProps) {
  const [url, setUrl] = useState("")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [mode, setMode] = useState("detect")
  const [threads, setThreads] = useState(10)
  const [riskLevel, setRiskLevel] = useState("1")
  const [level, setLevel] = useState("1")

  const modes = [
    { value: "detect", label: "Vulnerability Detection" },
    { value: "exploit", label: "Data Extraction" },
  ]

  const riskLevels = [
    { value: "1", label: "1 - Low Risk" },
    { value: "2", label: "2 - Medium Risk" },
    { value: "3", label: "3 - High Risk" },
  ]

  const testLevels = [
    { value: "1", label: "1 - Basic Tests" },
    { value: "2", label: "2 - Cookie Tests" },
    { value: "3", label: "3 - User-Agent Tests" },
    { value: "4", label: "4 - Referer Tests" },
    { value: "5", label: "5 - Host Tests" },
  ]

  const handleScan = async (): Promise<string> => {
    if (!url.trim()) {
      throw new Error("Please enter a target URL")
    }

    const response = await fetch("/api/exploitation/sqli", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url.trim(),
        params: "", 
        threads: threads,
        mode: mode,
        risk: riskLevel,
        level: level,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "SQLMap scan failed")
    }

    return data.data || "No scan results available"
  }

  useEffect(() => {
    onRegisterScan(handleScan)
  }, [url, mode, threads, riskLevel, level, onRegisterScan])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          SQL Injection Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Target URL</Label>
          <Input
            id="url"
            placeholder="http://localhost/vulnerabilities/sqli/?id=1&Submit=Submit"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter a URL with parameters. SQLMap will automatically detect injectable parameters.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Scan Mode</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue placeholder="Select scan mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <div className="space-y-2">
                  <Label htmlFor="threads">Threads</Label>
                  <Input
                    id="threads"
                    type="number"
                    min="1"
                    max="20"
                    value={threads}
                    onChange={(e) => setThreads(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select value={riskLevel} onValueChange={setRiskLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      {riskLevels.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test level" />
                    </SelectTrigger>
                    <SelectContent>
                      {testLevels.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-md bg-muted p-4">
          <h4 className="font-medium mb-2">Test URLs:</h4>
          <div className="space-y-1 text-sm">
            <div>
              • DVWA: <code>http://localhost/vulnerabilities/sqli/?id=1&Submit=Submit</code>
            </div>
            <div>
              • DVWA Blind: <code>http://localhost/vulnerabilities/sqli_blind/?id=1&Submit=Submit</code>
            </div>
            <div>
              • bWAPP: <code>http://localhost/sqli_1.php?title=test&action=search</code>
            </div>
            <div>
              • Mutillidae:{" "}
              <code>http://localhost/mutillidae/index.php?page=user-info.php&username=admin&password=admin</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
