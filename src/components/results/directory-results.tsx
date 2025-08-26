"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FolderSearch,
  ExternalLink,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  TreePine,
} from "lucide-react"
import { useState, useMemo } from "react"
import { DirectoryTreeView } from "./directory-tree-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ansiToHtml } from "@/utils/ansi"

interface DirectoryResult {
  output: string
}

interface ParsedDirectoryData {
  target: string
  tool: string
  totalRequests: number
  foundPaths: Array<{
    path: string
    status: number
    size: number
    contentType?: string
    title?: string
    interesting: boolean
  }>
  statistics: {
    total: number
    found: number
    errors: number
    redirects: number
  }
  scanDuration: number
}

function cleanPath(path: string): string {
  if (!path || typeof path !== 'string') return ''
  let cleaned = ansiToHtml(path)
    .replace(/<[^>]*>/g, '')
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .replace(/[\u001b\u009b][[()#?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
  if (cleaned && !cleaned.startsWith('/') && !cleaned.startsWith('http')) {
    cleaned = `/${cleaned}`
  }
  
  return cleaned
}


function parseDirectoryOutput(output: string): ParsedDirectoryData {
  const lines = output.split("\n").filter((line) => line.trim())
  
  const result: ParsedDirectoryData = {
    target: "",
    tool: "unknown",
    totalRequests: 0,
    foundPaths: [],
    statistics: {
      total: 0,
      found: 0,
      errors: 0,
      redirects: 0,
    },
    scanDuration: 0,
  }

  const lowerOutput = output.toLowerCase()
  if (lowerOutput.includes("ffuf")) {
    result.tool = "ffuf"
  } else if (lowerOutput.includes("gobuster")) {
    result.tool = "gobuster"
  } else if (lowerOutput.includes("dirsearch")) {
    result.tool = "dirsearch"
  }

  const targetMatch = output.match(/(?:Target|URL):\s*(\S+)/i) || output.match(/https?:\/\/[^\s]+/i)
  if (targetMatch) {
    const rawTarget = targetMatch[1] || targetMatch[0]
    result.target = cleanPath(rawTarget)
  }

  if (result.tool === "ffuf") {
    const ffufMatches = output.matchAll(/(\S+)\s+\[Status:\s*(\d+),\s*Size:\s*(\d+),.*?\]/g)
    for (const match of ffufMatches) {
      const rawPath = match[1]
      const cleanRawPath = cleanPath(rawPath)
      const path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`
      const status = Number.parseInt(match[2])
      const size = Number.parseInt(match[3])

      result.foundPaths.push({
        path,
        status,
        size,
        interesting: isInterestingPath(path, status),
      })
    }
  }

  else if (result.tool === "gobuster") {
    let foundPaths = 0
    
         // Format 1: /path (Status: 200) [Size: 1234]
     const format1Matches = output.matchAll(/(\S+)\s+\(Status:\s*(\d+)\)\s*\[Size:\s*(\d+)\]/g)
     for (const match of format1Matches) {
       const rawPath = match[1]
       const cleanRawPath = cleanPath(rawPath)
       const path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`
       const status = Number.parseInt(match[2])
       const size = Number.parseInt(match[3])

       result.foundPaths.push({
         path,
         status,
         size,
         interesting: isInterestingPath(path, status),
       })
       foundPaths++
     }
    
         // Format 2: /path 200 [Size: 1234]
     if (foundPaths === 0) {
       const format2Matches = output.matchAll(/(\S+)\s+(\d{3})\s+\[Size:\s*(\d+)\]/g)
       for (const match of format2Matches) {
         const rawPath = match[1]
         const cleanRawPath = cleanPath(rawPath)
         const path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`
         const status = Number.parseInt(match[2])
         const size = Number.parseInt(match[3])

         result.foundPaths.push({
           path,
           status,
           size,
           interesting: isInterestingPath(path, status),
         })
         foundPaths++
       }
     }
    
         // Format 3: /path (Status: 200) [Size: 1234] [Words: 123]
     if (foundPaths === 0) {
       const format3Matches = output.matchAll(/(\S+)\s+\(Status:\s*(\d+)\)\s*\[Size:\s*(\d+)\].*?\[Words:\s*(\d+)\]/g)
       for (const match of format3Matches) {
         const rawPath = match[1]
         const cleanRawPath = cleanPath(rawPath)
         const path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`
         const status = Number.parseInt(match[2])
         const size = Number.parseInt(match[3])

         result.foundPaths.push({
           path,
           status,
           size,
           interesting: isInterestingPath(path, status),
         })
         foundPaths++
       }
     }
    
    // Format 4: Generic pattern for any gobuster output
    if (foundPaths === 0) {
      const lines = output.split('\n')
      for (const line of lines) {
        // Skip empty lines and debug lines
        if (!line.trim() || line.includes('DEBUG:') || line.includes('ERROR:')) continue
        
         const pathMatch = line.match(/(\/[^\s]+)/)
         const statusMatch = line.match(/(?:Status:\s*|\[Status:\s*|^|\s)(\d{3})(?:\]|\s|$)/)
         
         if (pathMatch && statusMatch) {
           const rawPath = pathMatch[1]
           const cleanRawPath = cleanPath(rawPath)
           const path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`
           const status = Number.parseInt(statusMatch[1])
           const size = 0
           
           result.foundPaths.push({
             path,
             status,
             size,
             interesting: isInterestingPath(path, status),
           })
           foundPaths++
         }
      }
    }
    result.foundPaths.forEach((pathObj, index) => {
      console.log(`DEBUG: Path ${index}:`, {
        original: pathObj.path,
        cleaned: cleanPath(pathObj.path)
      })
    })
  }

  else if (result.tool === "dirsearch") {
    const dirsearchMatches = output.matchAll(/(\d+)\s+(\d+)B?\s+(\S+)/g)
    for (const match of dirsearchMatches) {
      const status = Number.parseInt(match[1])
      const size = Number.parseInt(match[2])
      const rawPath = match[3]
      const cleanRawPath = cleanPath(rawPath)
      const path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`

      result.foundPaths.push({
        path,
        status,
        size,
        interesting: isInterestingPath(path, status),
      })
    }
  }

  // Generic parsing for other formats
  else {
    // Try to parse common patterns like "200 /path" or "/path 200"
    const genericMatches = output.matchAll(/(?:(\d{3})\s+(\S+)|(\S+)\s+(\d{3}))/g)
    for (const match of genericMatches) {
      let status: number, path: string

      if (match[1] && match[2]) {
        status = Number.parseInt(match[1])
        const rawPath = match[2]
        const cleanRawPath = cleanPath(rawPath)
        path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`
      } else if (match[3] && match[4]) {
        const rawPath = match[3]
        const cleanRawPath = cleanPath(rawPath)
        path = cleanRawPath.startsWith("/") ? cleanRawPath : `/${cleanRawPath}`
        status = Number.parseInt(match[4])
      } else {
        continue
      }

      result.foundPaths.push({
        path,
        status,
        size: 0, 
        interesting: isInterestingPath(path, status),
      })
    }
  }

  result.statistics = {
    total: result.foundPaths.length,
    found: result.foundPaths.filter((p) => p.status >= 200 && p.status < 400).length,
    errors: result.foundPaths.filter((p) => p.status >= 400).length,
    redirects: result.foundPaths.filter((p) => p.status >= 300 && p.status < 400).length,
  }

  return result
}

function isInterestingPath(path: string, status: number): boolean {
  const interestingPaths = [
    "admin",
    "login",
    "api",
    "backup",
    "config",
    "database",
    "db",
    "test",
    "dev",
    "staging",
    "upload",
    "uploads",
    "files",
    "docs",
    "documentation",
    "phpmyadmin",
    "wp-admin",
    "wp-content",
    "wp-includes",
    ".git",
    ".env",
    ".htaccess",
    "robots.txt",
    "sitemap.xml",
    "crossdomain.xml",
    "clientaccesspolicy.xml",
  ]

  const pathLower = path.toLowerCase()
  const isInterestingName = interestingPaths.some((interesting) => pathLower.includes(interesting))

  const isInterestingStatus = status === 403 || status === 401 || status === 500

  return isInterestingName || isInterestingStatus
}

export function VisualDirectoryResults({ result }: { result: DirectoryResult }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "redirect" | "error">("all")
  const [showInterestingOnly, setShowInterestingOnly] = useState(false)

  const data = parseDirectoryOutput(result.output)

  const filteredPaths = useMemo(() => {
    return data.foundPaths.filter((path) => {
      if (searchTerm && !path.path.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      if (statusFilter !== "all") {
        if (statusFilter === "success" && (path.status < 200 || path.status >= 300)) return false
        if (statusFilter === "redirect" && (path.status < 300 || path.status >= 400)) return false
        if (statusFilter === "error" && path.status < 400) return false
      }

      if (showInterestingOnly && !path.interesting) return false

      return true
    })
  }, [data.foundPaths, searchTerm, statusFilter, showInterestingOnly])

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600 bg-green-50"
    if (status >= 300 && status < 400) return "text-blue-600 bg-blue-50"
    if (status >= 400) return "text-red-600 bg-red-50"
    return "text-gray-600 bg-gray-50"
  }

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status >= 300 && status < 400) return <AlertCircle className="h-4 w-4 text-blue-500" />
    if (status >= 400) return <XCircle className="h-4 w-4 text-red-500" />
    return null
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const exportToCsv = () => {
    const headers = ["Path", "Status", "Size", "Content-Type", "Interesting"]
    const csvContent = [
      headers.join(","),
      ...filteredPaths.map((path) =>
        [path.path, path.status, path.size, path.contentType || "", path.interesting ? "Yes" : "No"].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `directory-scan-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderSearch className="h-5 w-5" />
            Directory Scan Results
            {data.tool && (
              <Badge variant="outline" className="ml-2">
                {data.tool.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.statistics.total}</div>
              <div className="text-sm text-muted-foreground">Total Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.statistics.found}</div>
              <div className="text-sm text-muted-foreground">Accessible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.statistics.redirects}</div>
              <div className="text-sm text-muted-foreground">Redirects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{data.statistics.errors}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Tree View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-4">
          <DirectoryTreeView paths={data.foundPaths} target={data.target} />
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search paths..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "success" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("success")}
                  >
                    Success
                  </Button>
                  <Button
                    variant={statusFilter === "redirect" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("redirect")}
                  >
                    Redirects
                  </Button>
                  <Button
                    variant={statusFilter === "error" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("error")}
                  >
                    Errors
                  </Button>
                </div>
                <Button
                  variant={showInterestingOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowInterestingOnly(!showInterestingOnly)}
                >
                  Interesting Only
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Found Paths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Discovered Paths ({filteredPaths.length})</span>
                <Button variant="outline" size="sm" onClick={exportToCsv}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredPaths.map((path, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(path.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{path.path}</span>
                          {path.interesting && (
                            <Badge variant="secondary" className="text-orange-600">
                              Interesting
                            </Badge>
                          )}
                        </div>
                        {path.contentType && <div className="text-sm text-muted-foreground">{path.contentType}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(path.status)}`}>
                          {path.status}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{formatSize(path.size)}</div>
                      </div>
                      {data.target && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={`${data.target}${path.path}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              const fullUrl = `${data.target}${path.path}`
                              if (!fullUrl.match(/^https?:\/\/.+/i)) {
                                e.preventDefault()
                                console.warn('Invalid URL format:', fullUrl)
                              }
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredPaths.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderSearch className="h-8 w-8 mx-auto mb-2" />
                  <p>No paths found matching your filters</p>
                  {data.foundPaths.length === 0 && data.tool === "gobuster" && (
                    <div className="mt-4 text-left">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Show raw gobuster output for debugging
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                          {result.output}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
