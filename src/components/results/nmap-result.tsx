"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Server,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Network,
  Eye,
  Bug,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Port {
  port: number
  protocol: string
  state: "open" | "closed" | "filtered"
  service?: string
  version?: string
  product?: string
}

interface Host {
  ip: string
  hostname?: string
  status: "up" | "down"
  ports: Port[]
  os?: string
  latency?: string
}

interface NmapResults {
  hosts: Host[]
  scanType: string
  scanTime: string
  totalPorts: number
  openPorts: number
  closedPorts: number
  filteredPorts: number
}

function parseNmapOutput(rawOutput: string): NmapResults {
  const lines = rawOutput.split("\n")
  const hosts: Host[] = []
  let currentHost: Host | null = null
  let scanType = "Unknown"
  const scanTime = new Date().toISOString()

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.includes("Nmap scan report for")) {
      if (currentHost) hosts.push(currentHost)
      const match = trimmed.match(/Nmap scan report for (.+?)(?:\s+$$(.+?)$$)?$/)
      currentHost = {
        ip: match?.[2] || match?.[1] || "Unknown",
        hostname: match?.[2] ? match[1] : undefined,
        status: "up",
        ports: [],
      }
    }

    if (trimmed.includes("Host is up") && currentHost) {
      const latencyMatch = trimmed.match(/$$(.+?)$$/)
      if (latencyMatch) currentHost.latency = latencyMatch[1]
    }

    if (/^\d+\/\w+\s+\w+/.test(trimmed) && currentHost) {
      const parts = trimmed.split(/\s+/)
      const [portProto, state, ...serviceParts] = parts
      const [port, protocol] = portProto.split("/")

      const portInfo: Port = {
        port: Number.parseInt(port),
        protocol,
        state: state as "open" | "closed" | "filtered",
      }

      if (serviceParts.length > 0) {
        portInfo.service = serviceParts[0]
        if (serviceParts.length > 1) {
          portInfo.version = serviceParts.slice(1).join(" ")
        }
      }

      currentHost.ports.push(portInfo)
    }

    if (trimmed.includes("Running:") && currentHost) {
      currentHost.os = trimmed.replace("Running:", "").trim()
    }

    if (trimmed.includes("SYN Stealth Scan")) scanType = "SYN Stealth Scan"
    if (trimmed.includes("Connect Scan")) scanType = "Connect Scan"
    if (trimmed.includes("UDP Scan")) scanType = "UDP Scan"
  }

  if (currentHost) hosts.push(currentHost)

  const totalPorts = hosts.reduce((sum, host) => sum + host.ports.length, 0)
  const openPorts = hosts.reduce((sum, host) => sum + host.ports.filter((p) => p.state === "open").length, 0)
  const closedPorts = hosts.reduce((sum, host) => sum + host.ports.filter((p) => p.state === "closed").length, 0)
  const filteredPorts = hosts.reduce((sum, host) => sum + host.ports.filter((p) => p.state === "filtered").length, 0)

  return {
    hosts,
    scanType,
    scanTime,
    totalPorts,
    openPorts,
    closedPorts,
    filteredPorts,
  }
}

function PortStatusIcon({ state }: { state: string }) {
  switch (state) {
    case "open":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "closed":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "filtered":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

function PortCard({ port }: { port: Port }) {
  const getPortColor = (state: string) => {
    switch (state) {
      case "open":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      case "closed":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      case "filtered":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
    }
  }

  const getServiceIcon = (service?: string) => {
    if (!service) return <Network className="h-4 w-4" />
    if (service.includes("http")) return <Globe className="h-4 w-4" />
    if (service.includes("ssh")) return <Shield className="h-4 w-4" />
    if (service.includes("ftp")) return <Server className="h-4 w-4" />
    return <Network className="h-4 w-4" />
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", getPortColor(port.state))}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PortStatusIcon state={port.state} />
            <span className="font-mono font-semibold">
              {port.port}/{port.protocol}
            </span>
          </div>
          <Badge variant={port.state === "open" ? "default" : "secondary"}>{port.state.toUpperCase()}</Badge>
        </div>

        {port.service && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getServiceIcon(port.service)}
            <span>{port.service}</span>
          </div>
        )}

        {port.version && <div className="text-xs text-muted-foreground mt-1 font-mono">{port.version}</div>}
      </CardContent>
    </Card>
  )
}

function HostCard({ host }: { host: Host }) {
  const openPorts = host.ports.filter((p) => p.state === "open")
  const closedPorts = host.ports.filter((p) => p.state === "closed")
  const filteredPorts = host.ports.filter((p) => p.state === "filtered")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          <div>
            <div className="flex items-center gap-2">
              {host.hostname && <span>{host.hostname}</span>}
              <span className="font-mono text-sm text-muted-foreground">({host.ip})</span>
              <Badge variant={host.status === "up" ? "default" : "destructive"}>{host.status.toUpperCase()}</Badge>
            </div>
            {host.latency && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                <span>Latency: {host.latency}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {host.os && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Eye className="h-4 w-4" />
            <span className="text-sm">
              <strong>OS Detection:</strong> {host.os}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{openPorts.length}</div>
            <div className="text-sm text-green-600">Open</div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{closedPorts.length}</div>
            <div className="text-sm text-red-600">Closed</div>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{filteredPorts.length}</div>
            <div className="text-sm text-yellow-600">Filtered</div>
          </div>
        </div>

        {host.ports.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Network className="h-4 w-4" />
              Port Details
            </h4>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {host.ports.map((port, index) => (
                <PortCard key={index} port={port} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ScanSummary({ results }: { results: NmapResults }) {
  const openPercentage = results.totalPorts > 0 ? (results.openPorts / results.totalPorts) * 100 : 0
  const closedPercentage = results.totalPorts > 0 ? (results.closedPorts / results.totalPorts) * 100 : 0
  const filteredPercentage = results.totalPorts > 0 ? (results.filteredPorts / results.totalPorts) * 100 : 0

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Scan Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{results.hosts.length}</div>
            <div className="text-sm text-muted-foreground">Hosts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{results.openPorts}</div>
            <div className="text-sm text-muted-foreground">Open Ports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{results.closedPorts}</div>
            <div className="text-sm text-muted-foreground">Closed Ports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{results.filteredPorts}</div>
            <div className="text-sm text-muted-foreground">Filtered Ports</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Port Status Distribution</span>
            <span>{results.totalPorts} total ports</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
            <div className="bg-green-500" style={{ width: `${openPercentage}%` }} />
            <div className="bg-red-500" style={{ width: `${closedPercentage}%` }} />
            <div className="bg-yellow-500" style={{ width: `${filteredPercentage}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Open ({openPercentage.toFixed(1)}%)</span>
            <span>Closed ({closedPercentage.toFixed(1)}%)</span>
            <span>Filtered ({filteredPercentage.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Scan Type: {results.scanType}</span>
          <span>•</span>
          <span>Completed: {new Date(results.scanTime).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function VisualNmapResults({ rawOutput }: { rawOutput: string }) {
  const [results, setResults] = useState<NmapResults | null>(null)

  useEffect(() => {
    if (rawOutput && rawOutput.trim()) {
      try {
        let outputToParse = rawOutput
        try {
          const parsed = JSON.parse(rawOutput)
          if (parsed.output) {
            outputToParse = parsed.output
          }
        } catch {
          //  raw output
        }

        const parsedResults = parseNmapOutput(outputToParse)
        setResults(parsedResults)
      } catch (error) {
        console.error("Error parsing nmap output:", error)
      }
    }
  }, [rawOutput])

  if (!results || results.hosts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No scan results to display</p>
        <p className="text-sm">Run an nmap scan to see visual results here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ScanSummary results={results} />

      <div className="space-y-4">
        {results.hosts.map((host, index) => (
          <HostCard key={index} host={host} />
        ))}
      </div>
    </div>
  )
}
