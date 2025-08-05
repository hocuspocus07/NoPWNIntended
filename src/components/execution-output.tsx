"use client"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useIsMobile } from "@/hooks/use-mobile" // Assuming this path is correct

interface ExecutionOutputViewerProps {
  output: string
  command: string
  toolName: string
  onBack: () => void
}

export function ExecutionOutputViewer({ output, command, toolName, onBack }: ExecutionOutputViewerProps) {
  const isMobile = useIsMobile()

  const containerClasses = isMobile
    ? "fixed inset-0 z-50 flex flex-col bg-background p-4 overflow-hidden"
    : "w-full h-full flex flex-col"

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Back to History</span>
        </Button>
        <h2 className="text-xl font-semibold truncate">
          Output for <span className="font-mono text-primary">{toolName}</span>:{" "}
          <span className="font-mono text-muted-foreground">{command}</span>
        </h2>
      </div>
      <Card className="flex-1 min-h-0">
        <CardHeader>
          <CardTitle>Full Output</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-6rem)] overflow-auto custom-scroll">
          <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-md">
            {output || "No output available."}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
