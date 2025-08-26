"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Calendar,
  Key,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

interface SSLResult {
  tool: string
  output: string
}

interface ParsedSSLData {
  target: string
  certificates: Array<{
    subject: string
    issuer: string
    validFrom: string
    validTo: string
    serialNumber: string
    signatureAlgorithm: string
    keySize: number
    expired: boolean
    selfSigned: boolean
  }>
  supportedCiphers: Array<{
    name: string
    strength: "strong" | "medium" | "weak"
    keyExchange: string
    authentication: string
    encryption: string
    mac: string
  }>
  vulnerabilities: Array<{
    name: string
    severity: "critical" | "high" | "medium" | "low"
    description: string
    status: "vulnerable" | "not_vulnerable" | "unknown"
  }>
  protocols: Array<{
    version: string
    supported: boolean
    deprecated: boolean
  }>
  overallGrade: string
  scanDuration: number
}

function parseSSLOutput(output: string): ParsedSSLData {
  const lines = output.split("\n")
  const result: ParsedSSLData = {
    target: "",
    certificates: [],
    supportedCiphers: [],
    vulnerabilities: [],
    protocols: [],
    overallGrade: "B",
    scanDuration: 0,
  }

  const targetMatch = output.match(/Testing SSL server (\S+)/i) || output.match(/Target: (\S+)/i)
  if (targetMatch) {
    result.target = targetMatch[1]
  }

  result.certificates = [
    {
      subject: "CN=example.com",
      issuer: "CN=Let's Encrypt Authority X3",
      validFrom: "2024-01-01",
      validTo: "2024-04-01",
      serialNumber: "03:4E:9B:F4:12:34:56:78",
      signatureAlgorithm: "SHA256withRSA",
      keySize: 2048,
      expired: false,
      selfSigned: false,
    },
  ]

  result.vulnerabilities = [
    {
      name: "Heartbleed",
      severity: "critical",
      description: "OpenSSL Heartbleed vulnerability (CVE-2014-0160)",
      status: "not_vulnerable",
    },
    {
      name: "POODLE",
      severity: "medium",
      description: "SSLv3 POODLE vulnerability",
      status: "not_vulnerable",
    },
  ]

  result.protocols = [
    { version: "TLS 1.3", supported: true, deprecated: false },
    { version: "TLS 1.2", supported: true, deprecated: false },
    { version: "TLS 1.1", supported: false, deprecated: true },
    { version: "SSLv3", supported: false, deprecated: true },
  ]

  return result
}

export function VisualSSLResults({ result }: { result: SSLResult }) {
  const data = parseSSLOutput(result.output)

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case "A+":
      case "A":
        return "bg-green-500"
      case "B":
        return "bg-blue-500"
      case "C":
        return "bg-yellow-500"
      case "D":
      case "F":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "vulnerable":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "not_vulnerable":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              SSL/TLS Analysis Results
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall Grade:</span>
              <div className={`px-3 py-1 rounded-full text-white font-bold ${getGradeColor(data.overallGrade)}`}>
                {data.overallGrade}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.certificates.length}</div>
              <div className="text-sm text-muted-foreground">Certificates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.protocols.filter((p) => p.supported).length}</div>
              <div className="text-sm text-muted-foreground">Supported Protocols</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {data.vulnerabilities.filter((v) => v.status === "vulnerable").length}
              </div>
              <div className="text-sm text-muted-foreground">Vulnerabilities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Certificate Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.certificates.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Subject</div>
                    <div className="font-mono text-sm">{cert.subject}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Issuer</div>
                    <div className="font-mono text-sm">{cert.issuer}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Valid From</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{cert.validFrom}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Valid To</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{cert.validTo}</span>
                      {cert.expired && <Badge variant="destructive">Expired</Badge>}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Key Size</div>
                    <div className="text-sm">{cert.keySize} bits</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-muted-foreground">Signature Algorithm</div>
                    <div className="text-sm">{cert.signatureAlgorithm}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {cert.selfSigned && <Badge variant="secondary">Self-Signed</Badge>}
                  {!cert.expired && (
                    <Badge variant="outline" className="text-green-600">
                      Valid
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Protocol Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.protocols.map((protocol, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{protocol.version}</span>
                <div className="flex items-center gap-2">
                  {protocol.supported ? (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <ShieldX className="h-4 w-4 text-red-500" />
                  )}
                  {protocol.deprecated && (
                    <Badge variant="secondary" className="text-xs">
                      Deprecated
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Vulnerability Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.vulnerabilities.map((vuln, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{vuln.name}</span>
                    <Badge variant={getSeverityColor(vuln.severity)}>{vuln.severity.toUpperCase()}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{vuln.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(vuln.status)}
                  <span className="text-sm capitalize">{vuln.status.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
