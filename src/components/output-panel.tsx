"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState } from "react"

export function OutputPanel({
  output,
  isLoading,
}: {
  output: string
  isLoading: boolean
}) {
  const [parsedOutput, setParsedOutput] = useState<{
    output?: string
    reportContent?: string
    tool?: string
  } | null>(null)

  useEffect(() => {
    if (output) {
      try {
        setParsedOutput(JSON.parse(output))
      } catch {
        setParsedOutput({ output })
      }
    } else {
      setParsedOutput(null)
    }
  }, [output])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(parsedOutput?.output || "")
    toast("Output copied to clipboard")
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
        <h3 className="font-semibold">Scan Results</h3>
        <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!parsedOutput?.output}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Scanning...</span>
          </div>
        ) : parsedOutput?.tool === "skipfish" && parsedOutput.reportContent ? (
          <div className="h-full p-4">
            <iframe
              srcDoc={parsedOutput.reportContent}
              className="w-full h-full border rounded"
              title="Skipfish Report"
            />
          </div>
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