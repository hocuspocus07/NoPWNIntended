"use client"

import { useState } from "react"
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

export function SubdomainPanel() {
  const [domain, setDomain] = useState("")
  const [subdomains, setSubdomains] = useState<{subdomain: string, source: string}[]>([])
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
        
        {subdomains.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subdomains.map((item, index) => (
                  <TableRow key={`${item.subdomain}-${index}`}>
                    <TableCell className="font-mono">{item.subdomain}</TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell className="text-right">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
                        Live
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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