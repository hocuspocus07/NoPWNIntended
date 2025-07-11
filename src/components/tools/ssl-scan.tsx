"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight, Shield } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SslScannerPanel() {
  const [target, setTarget] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  
  // SSL/TLS version options
  const [tlsVersions, setTlsVersions] = useState({
    ssl2: false,
    ssl3: false,
    tls10: false,
    tls11: false,
    tls12: true,
    tls13: true
  })

  // Scan options
  const [scanOptions, setScanOptions] = useState({
    showCertificates: false,
    checkHeartbleed: true,
    checkCompression: true,
    checkFallback: true,
    showSigs: false
  })

  const startTlsProtocols = [
    { value: "none", label: "None" },
    { value: "smtp", label: "SMTP" },
    { value: "ftp", label: "FTP" },
    { value: "imap", label: "IMAP" },
    { value: "pop3", label: "POP3" },
    { value: "ldap", label: "LDAP" }
  ]
  const [startTls, setStartTls] = useState("none")

  const handleTlsVersionChange = (version: keyof typeof tlsVersions) => {
    setTlsVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }))
  }

  const handleScanOptionChange = (option: keyof typeof scanOptions) => {
    setScanOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          SSL/TLS Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="target">Target (host:port)</Label>
            <Input
              id="target"
              placeholder="example.com:443"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>STARTTLS Protocol</Label>
            <Select value={startTls} onValueChange={setStartTls}>
              <SelectTrigger>
                <SelectValue placeholder="Select protocol" />
              </SelectTrigger>
              <SelectContent>
                {startTlsProtocols.map((protocol) => (
                  <SelectItem key={protocol.value} value={protocol.value}>
                    {protocol.label}
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
            <div className="rounded-md border p-4 space-y-4">
              <div className="space-y-2">
                <Label>TLS Versions</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ssl2"
                      checked={tlsVersions.ssl2}
                      onCheckedChange={() => handleTlsVersionChange("ssl2")}
                    />
                    <Label htmlFor="ssl2">SSLv2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ssl3"
                      checked={tlsVersions.ssl3}
                      onCheckedChange={() => handleTlsVersionChange("ssl3")}
                    />
                    <Label htmlFor="ssl3">SSLv3</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tls10"
                      checked={tlsVersions.tls10}
                      onCheckedChange={() => handleTlsVersionChange("tls10")}
                    />
                    <Label htmlFor="tls10">TLS 1.0</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tls11"
                      checked={tlsVersions.tls11}
                      onCheckedChange={() => handleTlsVersionChange("tls11")}
                    />
                    <Label htmlFor="tls11">TLS 1.1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tls12"
                      checked={tlsVersions.tls12}
                      onCheckedChange={() => handleTlsVersionChange("tls12")}
                    />
                    <Label htmlFor="tls12">TLS 1.2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tls13"
                      checked={tlsVersions.tls13}
                      onCheckedChange={() => handleTlsVersionChange("tls13")}
                    />
                    <Label htmlFor="tls13">TLS 1.3</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Scan Options</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-certs"
                      checked={scanOptions.showCertificates}
                      onCheckedChange={() => handleScanOptionChange("showCertificates")}
                    />
                    <Label htmlFor="show-certs">Show Certificates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="heartbleed"
                      checked={scanOptions.checkHeartbleed}
                      onCheckedChange={() => handleScanOptionChange("checkHeartbleed")}
                    />
                    <Label htmlFor="heartbleed">Check Heartbleed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compression"
                      checked={scanOptions.checkCompression}
                      onCheckedChange={() => handleScanOptionChange("checkCompression")}
                    />
                    <Label htmlFor="compression">Check Compression</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="fallback"
                      checked={scanOptions.checkFallback}
                      onCheckedChange={() => handleScanOptionChange("checkFallback")}
                    />
                    <Label htmlFor="fallback">Check Fallback</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-sigs"
                      checked={scanOptions.showSigs}
                      onCheckedChange={() => handleScanOptionChange("showSigs")}
                    />
                    <Label htmlFor="show-sigs">Show Signatures</Label>
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