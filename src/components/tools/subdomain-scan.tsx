"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table"
import { Loader2, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { useToolTracking } from "@/hooks/use-tool-tracking" 

export function SubdomainPanel({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
const { startExecution, completeExecution } = useToolTracking() 
const [domain, setDomain] = useState("")
const [subdomains, setSubdomains] = useState<{ subdomain: string, source: string }[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [tool, setTool] = useState("assetfinder") 
const [advancedOpen, setAdvancedOpen] = useState(false)
const [threads, setThreads] = useState(10)
const [bruteforce, setBruteforce] = useState(false)
const [recursive, setRecursive] = useState(false)

const tools = [
  { value: "subfinder", label: "Subfinder" },
  { value: "amass", label: "Amass" },
  { value: "assetfinder", label: "Assetfinder" },
]

const techniques = [
  { id: "passive", label: "Passive Enumeration" },
  { id: "active", label: "Active DNS Resolution" },
  { id: "bruteforce", label: "Bruteforce" },
]

useEffect(() => {
  onRegisterScan(async () => {
    if (!domain.trim()) {
      throw new Error("Please enter a domain to scan")
    }

    if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain)) {
      throw new Error("Please enter a valid domain name")
    }

    setIsLoading(true)
    setError(null)
    setSubdomains([])

    const startTime = Date.now()
    let executionId: string | undefined
    let commandString = `${tool} -d ${domain}`
    let parameters: Record<string, any> = { domain, tool, threads, bruteforce, recursive }

    try {
      const basePayload = { domain };
      let response;
      
      switch (tool) {
        case "subfinder":
          commandString += ` -t ${threads}`
          if (bruteforce) commandString += ` -b`
          if (recursive) commandString += ` -r`
          response = await fetch("/api/recon/subdomain/subfinder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain, threads, bruteforce, recursive }),
          });
          break;

        case "amass":
          commandString += ` -active -passive`
          if (bruteforce) commandString += ` -brute`
          response = await fetch("/api/recon/subdomain/amass", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...basePayload,
              bruteforce,
              passive: true,
              active: true
            })
          });
          break;

        case "assetfinder":
          response = await fetch("/api/recon/subdomain/assetfinder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(basePayload)
          });
          break;
        default:
          throw new Error("Selected tool not implemented");
      }

      // Start execution tracking
      executionId = await startExecution({
        tool: tool,
        command: commandString,
        parameters: parameters,
        target: domain,
        results_summary: "",
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

      const result = await response.json();

      let subdomainsList: string[] = [];
      if (Array.isArray(result.data)) {
        subdomainsList = result.data;
      } else if (result.data?.subdomains) {
        subdomainsList = result.data.subdomains;
      } else if (typeof result.data === 'string') {
        subdomainsList = result.data.split('\n').filter((s: string) => s.trim());
      } else {
        throw new Error("Unexpected API response format");
      }

      const formattedSubdomains = subdomainsList
        .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
        .map((sub: string) => ({
          subdomain: sub.trim(),
          source: tool.toUpperCase()
        }));

      setSubdomains(formattedSubdomains)

      const output = JSON.stringify({
        tool: "subdomain-finder",
        message: `Found ${formattedSubdomains.length} subdomains`,
        subdomains: formattedSubdomains
      }, null, 2);

      if (executionId) {
        await completeExecution(executionId, output, duration, "completed", "")
      }

      setIsLoading(false)
      return output;
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
}, [domain, tool, bruteforce, recursive, threads, onRegisterScan, startExecution, completeExecution])
return (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        Subdomain Finder
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="domain">Target Domain</Label>
          <Input
            id="domain"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Tool</Label>
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
                  max="50"
                  value={threads}
                  onChange={(e) => setThreads(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Techniques</Label>
                <div className="flex flex-wrap gap-4">
                  {techniques.map((tech) => (
                    <div key={tech.id} className="flex items-center space-x-2">
                      <Switch
                        id={tech.id}
                        checked={tech.id === "bruteforce" ? bruteforce : true}
                        onCheckedChange={
                          tech.id === "bruteforce"
                            ? setBruteforce
                            : undefined
                        }
                        disabled={tech.id !== "bruteforce"}
                      />
                      <Label htmlFor={tech.id}>{tech.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" />
          Running {tool} scan...
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
