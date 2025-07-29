"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Copy, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SubdomainResults } from "./subdomain-results"
import { useEffect, useState } from "react"

export function OutputPanel({ output, isLoading }: {
  output: string,
  isLoading: boolean
}) {
  const [parsedOutput, setParsedOutput] = useState<{
    output?: string;
    reportContent?: string;
    tool?: string;
  } | null>(null);

  useEffect(() => {
    if (output) {
      try {
        setParsedOutput(JSON.parse(output));
      } catch {
        setParsedOutput({ output });
      }
    } else {
      setParsedOutput(null);
    }
  }, [output]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(parsedOutput?.output || "");
    toast("Output copied to clipboard");
  };

  return (
    <div className="flex h-full flex-col text-foreground max-h-full">
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Scan Results</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          disabled={!parsedOutput?.output}
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
        ) : parsedOutput?.tool === "skipfish" && parsedOutput.reportContent ? (
          <div className="w-full h-full">
            <iframe 
              srcDoc={parsedOutput.reportContent}
              className="w-full h-full border-none"
              title="Skipfish Report"
            />
          </div>
        ) : parsedOutput?.output ? (
          <div className="w-full overflow-x-auto">
            <pre className="font-mono text-sm whitespace-pre-wrap w-full block">
              {parsedOutput.output}
            </pre>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No scan results yet. Run a scan to see output.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}