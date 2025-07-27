"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SubdomainResults } from "./subdomain-results"
export function OutputPanel({ output, isLoading }: { 
  output: string, 
  isLoading: boolean 
}) {
  let parsedData: {
    message?: string
    subdomains?: Array<{subdomain: string, source: string}>
  } | null = null

  try {
    parsedData = JSON.parse(output)
  } catch {
    parsedData = null
  }


  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    toast("Output copied to clipboard")
  }

  const formattedOutput = () => {
  try {
    // If output is JSON, pretty print it
    if (output.startsWith("{") || output.startsWith("[")) {
      return JSON.stringify(JSON.parse(output), null, 2);
    }
    // Replace literal \n sequences with actual newline characters
    return output.replace(/\\n/g, "\n");
  } catch {
    return output.replace(/\\n/g, "\n");
  }
};


  return (
    <div className="flex h-full flex-col text-foreground max-h-full">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Scan Results</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={copyToClipboard}
          disabled={!output}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Scanning...</span>
          </div>
        ) : parsedData?.subdomains ? (
          <SubdomainResults 
            results={parsedData.subdomains} 
            initialMessage={parsedData.message || "Found subdomains"} 
          />
        ) : output ? (
          <pre className="font-mono text-sm whitespace-pre-wrap">{formattedOutput()}</pre>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No scan results yet. Run a scan to see output.
          </div>
        )}
      </ScrollArea>
    </div>
  )
}