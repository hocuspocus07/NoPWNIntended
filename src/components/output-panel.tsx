"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, Download, FileText, ImageIcon, Eye } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { SubdomainResults } from "./subdomain-results"
import PcapResults from "./pcap-results"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ParsedOutput {
  output?: string
  reportContent?: string
  tool?: string
  progress?: {
    current: number
    total: number
    percentage: number
  }
  subdomains?: { subdomain: string; source: string }[]
  message?: string
  streams?: any[]
  flags?: any[]
  credentials?: any[]
  summary?: any
  files?: {
    name: string
    type: "csv" | "image" | "text"
    content: string
    size: number
    downloadUrl?: string
  }[]
  csvData?: string
  cleanedImage?: {
    name: string
    data: string
    size: number
  }
}

interface FilePreviewProps {
  file: {
    name: string
    type: "csv" | "image" | "text"
    content: string
    size: number
    downloadUrl?: string
  }
}

function FilePreviewCard({ file }: FilePreviewProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const downloadFile = () => {
    if (file.downloadUrl) {
      const a = document.createElement("a")
      a.href = file.downloadUrl
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      let blob: Blob
      if (file.type === "image") {
        const byteCharacters = atob(file.content.split(",")[1] || file.content)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: "image/jpeg" })
      } else {
        blob = new Blob([file.content], {
          type: file.type === "csv" ? "text/csv" : "text/plain",
        })
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    toast(`Downloaded ${file.name}`)
  }

  const getFileIcon = () => {
    switch (file.type) {
      case "csv":
        return <FileText className="h-8 w-8 text-green-500" />
      case "image":
        return <ImageIcon className="h-8 w-8 text-blue-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getFileIcon()}
          <div>
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>{file.name}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                {file.type === "image" ? (
                  <div className="flex justify-center p-4">
                    <img
                      src={file.content.startsWith("data:") ? file.content : `data:image/jpeg;base64,${file.content}`}
                      alt={file.name}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <pre className="text-sm p-4 bg-muted rounded-lg overflow-x-auto">{file.content}</pre>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
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
          setPcapData(parsed)
        }
      } catch {
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
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {parsedOutput?.files && parsedOutput.files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Generated Files</h4>
                  <div className="grid gap-2">
                    {parsedOutput.files.map((file, index) => (
                      <FilePreviewCard key={index} file={file} />
                    ))}
                  </div>
                </div>
              )}

              {parsedOutput?.cleanedImage && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Cleaned Image (Metadata Removed)</h4>
                  <FilePreviewCard
                    file={{
                      name: parsedOutput.cleanedImage.name,
                      type: "image",
                      content: `data:image/jpeg;base64,${parsedOutput.cleanedImage.data}`,
                      size: parsedOutput.cleanedImage.size,
                    }}
                  />
                </div>
              )}

              {pcapData ? (
                <PcapResults results={pcapData} />
              ) : subdomainData ? (
                <SubdomainResults results={subdomainData.subdomains} initialMessage={subdomainData.message} />
              ) : isHtmlContent && parsedOutput?.output ? (
                <div
                  className="font-mono text-sm whitespace-pre-wrap break-words ssl-output"
                  dangerouslySetInnerHTML={{ __html: parsedOutput.output }}
                />
              ) : parsedOutput?.output ? (
                <pre className="font-mono text-sm whitespace-pre-wrap break-words">{parsedOutput.output}</pre>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No scan results yet. Run a scan to see output.
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
