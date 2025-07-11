"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export function NmapPanel({ target, onCommandGenerated }: {
  target: string
  onCommandGenerated: (command: string) => void
}) {
  const [advancedOptions, setAdvancedOptions] = useState({
    serviceDetection: true,
    defaultScripts: false,
    osDetection: false,
    traceroute: false,
    aggressive: false,
    portRange: "21,22,80,443",
    topPorts: 20,
    scanType: "SYN" // SYN, CONNECT, UDP, etc.
  })

  const onTargetChange = (value: string) => {
    if (value.trim() === "") {
      alert("Please enter a valid target.")
      return
    }
    target = value
  }

  const generateCommand = (scanType: string) => {
    let baseCommand = `nmap ${target}`

    switch(scanType) {
      case "fast":
        return `${baseCommand} -F`
      case "ping":
        return `${baseCommand} -sn`
      case "port":
        return `${baseCommand} -sV -p ${advancedOptions.portRange}`
      case "os":
        return `${baseCommand} -O`
      case "aggressive":
        return `${baseCommand} -A`
      case "cve-2021-41773":
        return `${baseCommand} --script=http-vuln-cve-2021-41773 -p 80,443,8080`
      case "top-ports":
        return `${baseCommand} --top-ports ${advancedOptions.topPorts}`
      case "udp":
        return `${baseCommand} -sU --top-ports ${advancedOptions.topPorts}`
      case "malware":
        return `${baseCommand} --script=http-malware-host --top-ports 3 -sV`
      case "banner":
        return `${baseCommand} --script=banner`
      case "http-headers":
        return `${baseCommand} --script=http-headers -p 80,443,8080`
      case "http-vuln":
        return `${baseCommand} --script="http-vuln*" -p 80,443,8080`
      default:
        return baseCommand
    }
  }

  const handleScan = (scanType: string) => {
    const command = generateCommand(scanType)
    onCommandGenerated(command)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg w-full text-foreground">
      <div className="space-y-2">
        <Label htmlFor="target">Target</Label>
        <Input 
          id="target" 
          value={target} 
          onChange={(e) => onTargetChange(e.target.value)} 
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
            <Button variant="outline" onClick={() => handleScan("fast")}>
              Fast Scan <Badge className="ml-2">-F</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("ping")}>
              Ping Scan <Badge className="ml-2">-sn</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("port")}>
              Service Scan <Badge className="ml-2">-sV</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("os")}>
              OS Detection <Badge className="ml-2">-O</Badge>
            </Button>
          </div>
        </TabsContent>

        {/* Advanced Scans Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Port Configuration</h4>
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
              <Input 
                className="w-32"
                value={advancedOptions.portRange}
                onChange={(e) => setAdvancedOptions({...advancedOptions, portRange: e.target.value})}
                placeholder="Ports (e.g. 21,22,80)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => handleScan("aggressive")}>
              Aggressive Scan <Badge className="ml-2">-A</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("cve-2021-41773")}>
              CVE-2021-41773 <Badge className="ml-2">--script</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("top-ports")}>
              Top {advancedOptions.topPorts} Ports <Badge className="ml-2">--top-ports</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("udp")}>
              UDP Scan <Badge className="ml-2">-sU</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("malware")}>
              Malware Check <Badge className="ml-2">--script</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("banner")}>
              Banner Grab <Badge className="ml-2">--script</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("http-headers")}>
              HTTP Headers <Badge className="ml-2">--script</Badge>
            </Button>
            <Button variant="outline" onClick={() => handleScan("http-vuln")}>
              HTTP Vulns <Badge className="ml-2">--script</Badge>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4">
        <div className="flex items-center justify-between">
          <Label>Port Presets</Label>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              setAdvancedOptions({...advancedOptions, topPorts: 5})
              handleScan("top-ports")
            }}>
              Top 5
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setAdvancedOptions({...advancedOptions, topPorts: 20})
              handleScan("top-ports")
            }}>
              Top 20
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setAdvancedOptions({...advancedOptions, topPorts: 100})
              handleScan("top-ports")
            }}>
              Top 100
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}