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
import { Loader2, Search, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

export function SubdomainPanel({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const [domain, setDomain] = useState("")
  const [subdomains, setSubdomains] = useState<{ subdomain: string, source: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tool, setTool] = useState("subfinder") // Default tool
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [threads, setThreads] = useState(10)
  const [bruteforce, setBruteforce] = useState(false)
  const [recursive, setRecursive] = useState(false)

  const tools = [
    { value: "subfinder", label: "Subfinder" },
    { value: "amass", label: "Amass" },
    { value: "assetfinder", label: "Assetfinder" },
    { value: "dnsgen", label: "DNSGen" },
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

      try {
        let token = localStorage.getItem("access_token");
        if (!token) {
          const supa = localStorage.getItem('sb-xkhhbysnfzdhkhbjtyut-auth-token');
          if (supa) {
            try {
              token = JSON.parse(supa).access_token;
            } catch (e) {
              token = null;
            }
          }
        }
        console.log("Token used for fetch:", token);
        let response;
        const basePayload = { domain };
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        switch (tool) {
          case "subfinder":
            response = await fetch("/api/recon/subdomain/subfinder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ domain }),
            });

            break;

          case "amass":
            response = await fetch("/api/recon/subdomain/amass", {
              method: "POST",
              headers,
              body: JSON.stringify({
                ...basePayload,
                bruteforce,
                passive: true, // Always include passive
                active: true   // Always include active
              })
            });
            break;

          case "assetfinder":
            response = await fetch("/api/recon/subdomain/assetfinder", {
              method: "POST",
              headers,
              body: JSON.stringify(basePayload)
            });
            break;

          default:
            throw new Error("Selected tool not implemented");
        }

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Subdomain scan failed")
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

        return JSON.stringify({
          message: `Found ${formattedSubdomains.length} subdomains`,
          subdomains: formattedSubdomains
        });
      } catch (err) {
        console.error("Subdomain scan error:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    })
  }, [domain, tool, bruteforce, recursive, threads, onRegisterScan])
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

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}