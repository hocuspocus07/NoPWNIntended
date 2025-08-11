"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { SubdomainResults } from "./subdomain-results"
import PcapResults from "./pcap-results"

interface ParsedOutput {
  output?: string
  reportContent?: string
  tool?: string
  progress?: {
    current: number
    total: number
    percentage: number
  }
  // Add specific properties for structured data
  subdomains?: { subdomain: string; source: string }[]
  message?: string
  // PCAP specific properties
  streams?: any[]
  flags?: any[]
  credentials?: any[]
  summary?: any
}

export function OutputPanel({
  output,
  isLoading,
}: {
  output: string
  isLoading: boolean
}) {
  const [parsedOutput, setParsedOutput] = useState<ParsedOutput | null>(null)
  const [progress, setProgress] = useState<{ current: number; total: number; percentage: number } | null>(null)
  const [isHtmlContent, setIsHtmlContent] = useState(false)
  const [subdomainData, setSubdomainData] = useState<{
    subdomains: { subdomain: string; source: string }[]
    message: string
  } | null>(null)
  const [pcapData, setPcapData] = useState<any>(null)

  useEffect(() => {
    setIsHtmlContent(false)
    setSubdomainData(null)
    setPcapData(null)
    setProgress(null)
    setParsedOutput(null)

    if (output) {
      try {
        const parsed = JSON.parse(output)
        setParsedOutput(parsed)

        if (parsed.progress) {
          setProgress(parsed.progress)
        }

        // specific tool outputs
        if (parsed.tool === "SSLScan" && typeof parsed.output === "string") {
          setIsHtmlContent(true)
        } else if (parsed.tool === "subdomain-finder" && Array.isArray(parsed.subdomains)) {
          setSubdomainData({ subdomains: parsed.subdomains, message: parsed.message || "" })
        } else if (parsed.tool === "PCAP Analyzer" && parsed.streams) {
          setPcapData({
            streams: parsed.streams || [],
            flags: parsed.flags || [],
            credentials: parsed.credentials || [],
            summary: parsed.summary || {},
          })
        } else if (parsed.streams && parsed.summary) {
          // direct PCAP data format
          setPcapData(parsed)
        }
      } catch {
        // treat as plain text
        const lines = output.split("\n")
        const progressLines = lines.filter((line) => line.includes("PROGRESS:"))

        if (progressLines.length > 0) {
          const lastProgress = progressLines[progressLines.length - 1]
          const match = lastProgress.match(/PROGRESS:(\d+):(\d+):(\d+)/)
          if (match) {
            setProgress({
              current: Number.parseInt(match[1]),
              total: Number.parseInt(match[2]),
              percentage: Number.parseInt(match[3]),
            })
          }
        }
        const cleanOutput = lines.filter((line) => !line.includes("PROGRESS:")).join("\n")
        setParsedOutput({ output: cleanOutput })
      }
    }
  }, [output])

  const copyToClipboard = () => {
    const textToCopy = parsedOutput?.output || JSON.stringify(pcapData || subdomainData, null, 2) || ""
    navigator.clipboard.writeText(textToCopy)
    toast("Output copied to clipboard")
  }

  const downloadResults = () => {
    const textToDownload = parsedOutput?.output || JSON.stringify(pcapData || subdomainData, null, 2) || ""
    const blob = new Blob([textToDownload], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `scan-results-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast("Results downloaded")
  }

  return (
    <div className="h-full flex flex-col overflow-hidden text-foreground">
      <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
        <h3 className="font-semibold">Scan Results</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            disabled={!parsedOutput?.output && !subdomainData && !pcapData}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadResults}
            disabled={!parsedOutput?.output && !subdomainData && !pcapData}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {isLoading && progress && (
        <div className="border-b p-4 flex-shrink-0">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Scanning in progress...</span>
            <span>
              {progress.current}/{progress.total} ({progress.percentage}%)
            </span>
          </div>
          <Progress value={progress.percentage} className="w-full" />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading && !progress ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Initializing scan...</span>
          </div>
        ) : pcapData ? (
          <ScrollArea className="h-full">
            <div className="p-4">
              <PcapResults results={pcapData} />
            </div>
          </ScrollArea>
        ) : subdomainData ? (
          <div className="p-4">
            <SubdomainResults results={subdomainData.subdomains} initialMessage={subdomainData.message} />
          </div>
        ) : isHtmlContent && parsedOutput?.output ? (
          <ScrollArea className="h-full">
            <div className="p-4" dangerouslySetInnerHTML={{ __html: parsedOutput.output }} />
          </ScrollArea>
        ) : parsedOutput?.output ? (
          <ScrollArea className="h-full">
            <div className="p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap break-words">{parsedOutput.output}</pre>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No scan results yet. Run a scan to see output.
          </div>
        )}
      </div>
    </div>
  )
}
