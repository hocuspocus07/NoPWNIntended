"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  User,
  Search,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Users,
  Eye,
  Clock,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SherlockResult {
  site: string
  url?: string
  status: "found" | "not_found" | "error" | "timeout"
  response_time?: number
  error_message?: string
}

interface SherlockResultsProps {
  result: {
    output: string
  }
}

export function VisualSherlockResults({ result }: SherlockResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"site" | "status">("site")

  const parsedResults = useMemo(() => {
    const results: SherlockResult[] = []
    const lines = result.output.split("\n")

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      if (trimmedLine.includes("[+]")) {
        // Found format: [+] Site: URL
        const match = trimmedLine.match(/\[\+\]\s*([^:]+):\s*(.+)/)
        if (match) {
          results.push({
            site: match[1].trim(),
            url: match[2].trim(),
            status: "found",
          })
        }
      } else if (trimmedLine.includes("[-]")) {
        // Not found format: [-] Site: Not Found
        const match = trimmedLine.match(/\[-\]\s*([^:]+):/)
        if (match) {
          results.push({
            site: match[1].trim(),
            status: "not_found",
          })
        }
      } else if (trimmedLine.includes("[!]")) {
        // Error format: [!] Site: Error message
        const match = trimmedLine.match(/\[!\]\s*([^:]+):\s*(.+)/)
        if (match) {
          results.push({
            site: match[1].trim(),
            status: "error",
            error_message: match[2].trim(),
          })
        }
      } else if (trimmedLine.includes("Checking username")) {
        // Skip progress lines
        continue
      } else if (trimmedLine.match(/^\w+:\s*https?:\/\//)) {
        const match = trimmedLine.match(/^([^:]+):\s*(.+)/)
        if (match) {
          results.push({
            site: match[1].trim(),
            url: match[2].trim(),
            status: "found",
          })
        }
      }
    }

    return results
  }, [result.output])

  const filteredAndSortedResults = useMemo(() => {
    const filtered = parsedResults.filter((result) => {
      const matchesSearch = result.site.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || result.status === selectedStatus
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      if (sortBy === "status") {
        const statusOrder = { found: 0, error: 1, timeout: 2, not_found: 3 }
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return a.site.localeCompare(b.site)
    })
  }, [parsedResults, searchTerm, selectedStatus, sortBy])

  const stats = useMemo(() => {
    const found = parsedResults.filter((r) => r.status === "found").length
    const notFound = parsedResults.filter((r) => r.status === "not_found").length
    const errors = parsedResults.filter((r) => r.status === "error").length
    const timeouts = parsedResults.filter((r) => r.status === "timeout").length
    const total = parsedResults.length

    return { found, notFound, errors, timeouts, total }
  }, [parsedResults])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "found":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "not_found":
        return <XCircle className="h-4 w-4 text-gray-400" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "timeout":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Globe className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "found":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Found
          </Badge>
        )
      case "not_found":
        return <Badge variant="secondary">Not Found</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "timeout":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            Timeout
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const downloadResults = () => {
    const csvContent = [
      "Site,Status,URL,Error",
      ...filteredAndSortedResults.map((r) => `"${r.site}","${r.status}","${r.url || ""}","${r.error_message || ""}"`),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sherlock-results-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (parsedResults.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No Sherlock results found in the output.</p>
            <p className="text-sm mt-2">Make sure the scan completed successfully.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sites</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Found</p>
                <p className="text-2xl font-bold text-green-600">{stats.found}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Not Found</p>
                <p className="text-2xl font-bold text-gray-600">{stats.notFound}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors + stats.timeouts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.total > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Username Discovery Rate</span>
                <span>
                  {stats.found} of {stats.total} sites ({Math.round((stats.found / stats.total) * 100)}%)
                </span>
              </div>
              <Progress value={(stats.found / stats.total) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Username Search Results ({filteredAndSortedResults.length})
            </span>
            <Button onClick={downloadResults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search platforms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["all", "found", "not_found", "error"].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status === "all" ? "All" : status.replace("_", " ")}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant={sortBy === "site" ? "default" : "outline"} size="sm" onClick={() => setSortBy("site")}>
                Sort by Site
              </Button>
              <Button
                variant={sortBy === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("status")}
              >
                Sort by Status
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredAndSortedResults.map((siteResult, index) => (
              <Card
                key={index}
                className={`transition-all hover:shadow-md ${
                  siteResult.status === "found"
                    ? "border-green-200 bg-green-50/50"
                    : siteResult.status === "error"
                      ? "border-red-200 bg-red-50/50"
                      : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(siteResult.status)}
                      <div>
                        <h3 className="font-medium">{siteResult.site}</h3>
                        {siteResult.url && (
                          <p className="text-sm text-muted-foreground truncate max-w-md">{siteResult.url}</p>
                        )}
                        {siteResult.error_message && (
                          <p className="text-sm text-red-600 mt-1">{siteResult.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(siteResult.status)}
                      {siteResult.url && siteResult.status === "found" && (
                        <Button variant="ghost" size="sm" onClick={() => window.open(siteResult.url, "_blank")}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAndSortedResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results match your current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
