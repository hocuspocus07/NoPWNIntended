"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Calendar,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Server,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WhoisData {
  domain: string
  registrar?: string
  registrationDate?: string
  expirationDate?: string
  lastUpdated?: string
  status?: string[]
  nameservers?: string[]
  registrant?: {
    name?: string
    organization?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  admin?: {
    name?: string
    organization?: string
    email?: string
    phone?: string
  }
  tech?: {
    name?: string
    organization?: string
    email?: string
    phone?: string
  }
  dnssec?: string
  raw?: string
}

function parseWhoisOutput(rawOutput: string): WhoisData {
  const lines = rawOutput.split("\n")
  const data: WhoisData = { domain: "" }

  for (const line of lines) {
    const originalLine = line.trim()
    const trimmed = originalLine.toLowerCase()

    if (trimmed.startsWith("domain name:") || trimmed.startsWith("domain:")) {
      const v = originalLine.split(":")[1]?.trim()
      data.domain = v?.replace(/^"|"$/g, "") || ""
    }

    if (trimmed.startsWith("registrar:") && !trimmed.includes("registrar url")) {
      data.registrar = originalLine.split(":")[1]?.trim()?.replace(/^"|"$/g, "")
    }

    const normalizeDate = (v?: string) => v?.replace(/^"|"$/g, "")?.replace(/\s+UTC$/i, "Z")
    if (trimmed.startsWith("creation date:") || trimmed.startsWith("registered on:") || trimmed.startsWith("created:")) {
      data.registrationDate = normalizeDate(originalLine.split(":")[1]?.trim())
    }
    if (trimmed.startsWith("expiry date:") || trimmed.startsWith("expires on:") || trimmed.startsWith("expires:")) {
      data.expirationDate = normalizeDate(originalLine.split(":")[1]?.trim())
    }
    if (trimmed.startsWith("updated date:") || trimmed.startsWith("last updated:") || trimmed.startsWith("modified:")) {
      data.lastUpdated = normalizeDate(originalLine.split(":")[1]?.trim())
    }

    if (trimmed.includes("status:") || trimmed.includes("domain status:")) {
      const status = originalLine.split(":")[1]?.trim()
      if (status) {
        data.status = data.status || []
        data.status.push(status)
      }
    }

    if (trimmed.startsWith("name server:") || trimmed.startsWith("nserver:")) {
      const ns = originalLine.split(":")[1]?.trim()?.replace(/^"|"$/g, "")
      if (ns) {
        data.nameservers = data.nameservers || []
        data.nameservers.push(ns)
      }
    }

    if (trimmed.startsWith("dnssec:")) {
      data.dnssec = originalLine.split(":")[1]?.trim()?.replace(/^"|"$/g, "")
    }

    if (trimmed.includes("registrant name:") || trimmed.includes("registrant:")) {
      data.registrant = data.registrant || {}
      data.registrant.name = originalLine.split(":")[1]?.trim()
    }
    if (trimmed.includes("registrant organization:") || trimmed.includes("registrant org:")) {
      data.registrant = data.registrant || {}
      data.registrant.organization = originalLine.split(":")[1]?.trim()
    }
    if (trimmed.includes("registrant email:")) {
      data.registrant = data.registrant || {}
      data.registrant.email = originalLine.split(":")[1]?.trim()
    }
    if (trimmed.includes("registrant phone:")) {
      data.registrant = data.registrant || {}
      data.registrant.phone = originalLine.split(":")[1]?.trim()
    }
    if (trimmed.includes("registrant country:")) {
      data.registrant = data.registrant || {}
      data.registrant.country = originalLine.split(":")[1]?.trim()
    }
  }

  data.raw = rawOutput
  return data
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase()
    if (lower.includes("ok") || lower.includes("active")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
    if (lower.includes("pending") || lower.includes("hold")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    }
    if (lower.includes("expired") || lower.includes("suspended")) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return <Badge className={cn("text-xs", getStatusColor(status))}>{status}</Badge>
}

function ContactCard({
  title,
  contact,
  icon: Icon,
}: {
  title: string
  contact?: {
    name?: string
    organization?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    country?: string
  }
  icon: any
}) {
  if (!contact || Object.keys(contact).length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            <span>{contact.name}</span>
          </div>
        )}
        {contact.organization && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-3 w-3 text-muted-foreground" />
            <span>{contact.organization}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.country && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{contact.country}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DateCard({
  title,
  date,
  icon: Icon,
  isExpired = false,
}: {
  title: string
  date?: string
  icon: any
  isExpired?: boolean
}) {
  if (!date) return null

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card
      className={cn("transition-colors", isExpired && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950")}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", isExpired ? "text-red-500" : "text-muted-foreground")} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className={cn("font-mono text-sm", isExpired && "text-red-600 dark:text-red-400")}>{formatDate(date)}</div>
      </CardContent>
    </Card>
  )
}

export function VisualWhoisResults({ rawOutput }: { rawOutput: string }) {
  const [data, setData] = useState<WhoisData | null>(null)

  useEffect(() => {
    if (rawOutput && rawOutput.trim()) {
      try {
        // Try to parse as JSON first
        let outputToParse = rawOutput
        try {
          const parsed = JSON.parse(rawOutput)
          if (parsed.output) {
            outputToParse = parsed.output
          }
        } catch {
          //use raw output
        }

        const parsedData = parseWhoisOutput(outputToParse)
        setData(parsedData)
      } catch (error) {
        console.error("Error parsing whois output:", error)
      }
    }
  }, [rawOutput])

  if (!data || !data.domain) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No WHOIS data to display</p>
        <p className="text-sm">Run a WHOIS lookup to see visual results here</p>
      </div>
    )
  }

  const isExpired = data.expirationDate && new Date(data.expirationDate) < new Date()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Domain Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold font-mono">{data.domain}</h3>
              {data.registrar && <p className="text-muted-foreground">Registered with {data.registrar}</p>}
            </div>
            {isExpired && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Expired
              </Badge>
            )}
          </div>

          {data.status && data.status.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Domain Status</h4>
              <div className="flex flex-wrap gap-2">
                {data.status.map((status, index) => (
                  <StatusBadge key={index} status={status} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <DateCard title="Registration Date" date={data.registrationDate} icon={Calendar} />
        <DateCard title="Last Updated" date={data.lastUpdated} icon={Clock} />
        <DateCard title="Expiration Date" date={data.expirationDate} icon={AlertCircle} isExpired={isExpired===""?undefined:isExpired} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.nameservers && data.nameservers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4" />
                Name Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.nameservers.map((ns, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm font-mono">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {ns}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.dnssec && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                DNSSEC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {data.dnssec.toLowerCase().includes("unsigned") ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm">{data.dnssec}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ContactCard title="Registrant" contact={data.registrant} icon={User} />
        <ContactCard title="Administrative Contact" contact={data.admin} icon={Shield} />
        <ContactCard title="Technical Contact" contact={data.tech} icon={Server} />
      </div>
    </div>
  )
}
