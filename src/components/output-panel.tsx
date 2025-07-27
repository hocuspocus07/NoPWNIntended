"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function OutputPanel({ output, isLoading }: { 
  output: string, 
  isLoading: boolean 
}) {

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
      return output;
    } catch {
      return output;
    }
  };

  return (
    <div className="flex h-full flex-col text-foreground">
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
        ) : output ? (
          <pre className="font-mono text-sm">{formattedOutput()}</pre>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No scan results yet. Run a scan to see output.
          </div>
        )}
      </ScrollArea>
    </div>
  )
}