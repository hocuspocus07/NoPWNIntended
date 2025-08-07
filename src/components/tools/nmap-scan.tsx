"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useToolTracking } from "@/hooks/use-tool-tracking" 
import { Loader2 } from 'lucide-react'

type ScanType = 
  | "fast" 
  | "ping" 
  | "port" 
  | "os" 
  | "aggressive" 
  | "cve-2021-41773" 
  | "top-ports" 
  | "udp" 
  | "malware" 
  | "banner" 
  | "http-headers" 
  | "http-vuln"

export function NmapPanel({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const { startExecution, completeExecution } = useToolTracking()
  const [target, setTarget] = useState("")
  const [activeScan, setActiveScan] = useState<ScanType>("port")
  const [advancedOptions, setAdvancedOptions] = useState({
    serviceDetection: true,
    defaultScripts: false,
    osDetection: false,
    traceroute: false,
    aggressive: false,
    portRange: "21,22,80,443,8080",
    topPorts: 20,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCommand = (scanType: ScanType): { command: string, parameters: any } => {
    let params = {
      target,
      ports: "",
      scripts: "",
      options: ""
    }

    let baseOptions = ["-T4"] 

    if (advancedOptions.serviceDetection) baseOptions.push("-sV")
    if (advancedOptions.defaultScripts) baseOptions.push("-sC")
    if (advancedOptions.osDetection) baseOptions.push("-O")
    if (advancedOptions.traceroute) baseOptions.push("--traceroute")

    switch(scanType) {
      case "fast":
        baseOptions.push("-F")
        params.ports = advancedOptions.portRange
        break
      case "ping":
        baseOptions = ["-sn"]
        break
      case "port":
        params.ports = advancedOptions.portRange
        break
      case "os":
        baseOptions.push("-O")
        break
      case "aggressive":
        baseOptions = ["-A", "-T4"]
        break
      case "cve-2021-41773":
        params.scripts = 'http-vuln-cve-2021-41773'
        params.ports = '80,443,8080'
        break
      case "top-ports":
        baseOptions.push(`--top-ports ${advancedOptions.topPorts}`)
        break
      case "udp":
        baseOptions.push("-sU")
        break
      case "malware":
        params.scripts = 'http-malware-host'
        params.ports = '80,443,8080'
        break
      case "banner":
        params.scripts = 'banner'
        break
      case "http-headers":
        params.scripts = 'http-headers'
        params.ports = '80,443,8080'
        break
      case "http-vuln":
        params.scripts = 'http-vuln*'
        params.ports = '80,443,8080'
        break
    }

    params.options = [...new Set(baseOptions)].join(" ")

    const commandString = `nmap ${params.options} ${params.ports ? '-p ' + params.ports : ''} ${params.scripts ? '--script ' + params.scripts : ''} ${target}`;

    return {
      command: commandString,
      parameters: { ...params, scanType, advancedOptions }
    }
  }

  useEffect(() => {
    if (target.trim()) {
      registerScan(activeScan)
    }
  }, [target, advancedOptions, activeScan])

  const registerScan = (scanType: ScanType) => {
    setActiveScan(scanType)
    
    if (!target.trim()) {
      toast("Please enter a valid target")
      return
    }

    const { command, parameters } = generateCommand(scanType)
    
    const scanFn = async () => {
      setIsLoading(true)
      setError(null)
      const startTime = Date.now()
      let executionId: string | undefined

      try {
        // Start execution tracking
        executionId = await startExecution({
          tool: "Nmap",
          command: command,
          parameters: parameters,
          target: target,
          results_summary: "",
        })

        const response = await fetch('/api/recon/nmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            target: parameters.target,
            ports: parameters.ports,
            scripts: parameters.scripts,
            options: parameters.options
          })
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

        const result = await response.json()
        const output = result.data && result.data.trim() ? result.data : "No output from scan"

        if (executionId) {
          await completeExecution(executionId, output, duration, "completed", "")
        }

        setIsLoading(false)
        return output
      } catch (err) {
        const errorMessage = (err as { message?: string })?.message || "Unknown error"
        if (executionId) {
          await completeExecution(executionId, "", Date.now() - startTime, "failed", errorMessage)
        }
        setIsLoading(false)
        setError(errorMessage)
        throw err
      }
    }

    onRegisterScan(scanFn)
  }

  const isActive = (scanType: ScanType) => activeScan === scanType

  return (
    <div className="space-y-4 p-4 border rounded-lg w-full text-foreground">
      <div className="space-y-2">
        <Label htmlFor="target">Target</Label>
        <Input 
          id="target" 
          value={target} 
          onChange={(e) => setTarget(e.target.value)} 
          placeholder="192.168.1.1 or example.com"
        />
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic">Basic Scans</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Scans</TabsTrigger>
        </TabsList>

        {/* Basic Scans Tab */}
        <TabsContent value="basic" className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={isActive("fast") ? "default" : "outline"}
              onClick={() => registerScan("fast")}
            >
              Fast Scan <Badge className="ml-2">-F</Badge>
            </Button>
            <Button 
              variant={isActive("ping") ? "default" : "outline"}
              onClick={() => registerScan("ping")}
            >
              Ping Scan <Badge className="ml-2">-sn</Badge>
            </Button>
            <Button 
              variant={isActive("port") ? "default" : "outline"}
              onClick={() => registerScan("port")}
            >
              Service Scan <Badge className="ml-2">-sV</Badge>
            </Button>
            <Button 
              variant={isActive("os") ? "default" : "outline"}
              onClick={() => registerScan("os")}
            >
              OS Detection <Badge className="ml-2">-O</Badge>
            </Button>
          </div>
        </TabsContent>

        {/* Advanced Scans Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Scan Options</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="service-detection" 
                  checked={advancedOptions.serviceDetection}
                  onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, serviceDetection: !!checked})}
                />
                <Label htmlFor="service-detection">Service Detection (-sV)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="default-scripts" 
                  checked={advancedOptions.defaultScripts}
                  onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, defaultScripts: !!checked})}
                />
                <Label htmlFor="default-scripts">Default Scripts (-sC)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="os-detection" 
                  checked={advancedOptions.osDetection}
                  onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, osDetection: !!checked})}
                />
                <Label htmlFor="os-detection">OS Detection (-O)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="traceroute" 
                  checked={advancedOptions.traceroute}
                  onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, traceroute: !!checked})}
                />
                <Label htmlFor="traceroute">Traceroute (--traceroute)</Label>
              </div>
            </div>

            <div className="pt-2">
              <Label htmlFor="port-range">Port Range</Label>
              <Input 
                id="port-range"
                className="w-full"
                value={advancedOptions.portRange}
                onChange={(e) => setAdvancedOptions({...advancedOptions, portRange: e.target.value})}
                placeholder="e.g. 21,22,80,443 or 1-1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={isActive("aggressive") ? "default" : "outline"}
              onClick={() => registerScan("aggressive")}
            >
              Aggressive Scan <Badge className="ml-2">-A</Badge>
            </Button>
            <Button 
              variant={isActive("cve-2021-41773") ? "default" : "outline"}
              onClick={() => registerScan("cve-2021-41773")}
            >
              CVE-2021-41773 <Badge className="ml-2">--script</Badge>
            </Button>
            <Button 
              variant={isActive("top-ports") ? "default" : "outline"}
              onClick={() => registerScan("top-ports")}
            >
              Top {advancedOptions.topPorts} Ports <Badge className="ml-2">--top-ports</Badge>
            </Button>
            <Button 
              variant={isActive("udp") ? "default" : "outline"}
              onClick={() => registerScan("udp")}
            >
              UDP Scan <Badge className="ml-2">-sU</Badge>
            </Button>
            <Button 
              variant={isActive("malware") ? "default" : "outline"}
              onClick={() => registerScan("malware")}
            >
              Malware Check <Badge className="ml-2">--script</Badge>
            </Button>
            <Button 
              variant={isActive("banner") ? "default" : "outline"}
              onClick={() => registerScan("banner")}
            >
              Banner Grab <Badge className="ml-2">--script</Badge>
            </Button>
            <Button 
              variant={isActive("http-headers") ? "default" : "outline"}
              onClick={() => registerScan("http-headers")}
            >
              HTTP Headers <Badge className="ml-2">--script</Badge>
            </Button>
            <Button 
              variant={isActive("http-vuln") ? "default" : "outline"}
              onClick={() => registerScan("http-vuln")}
            >
              HTTP Vulns <Badge className="ml-2">--script</Badge>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4">
        <div className="flex items-center justify-between">
          <Label>Port Presets</Label>
          <div className="flex gap-2">
            <Button 
              variant={advancedOptions.topPorts === 5 ? "default" : "ghost"} 
              size="sm" 
              onClick={() => {
                setAdvancedOptions({...advancedOptions, topPorts: 5})
                setActiveScan("top-ports")
              }}
            >
              Top 5
            </Button>
            <Button 
              variant={advancedOptions.topPorts === 20 ? "default" : "ghost"} 
              size="sm" 
              onClick={() => {
                setAdvancedOptions({...advancedOptions, topPorts: 20})
                setActiveScan("top-ports")
              }}
            >
              Top 20
            </Button>
            <Button 
              variant={advancedOptions.topPorts === 100 ? "default" : "ghost"} 
              size="sm" 
              onClick={() => {
                setAdvancedOptions({...advancedOptions, topPorts: 100})
                setActiveScan("top-ports")
              }}
            >
              Top 100
            </Button>
          </div>
        </div>
      </div>
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin h-4 w-4" />
          Running Nmap scan...
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
          Error: {error}
        </div>
      )}
    </div>
  )
}
