"use client"
import { useState, useCallback } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ToolOptions from "./tool-options"
import { OutputPanel } from "./output-panel"
import { Button } from "./ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

export function MainSection({ activeTool }: { activeTool: string | null,  activeToolTitle?: string | null
 }) {
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scanFn, setScanFn] = useState<() => Promise<string>>(
    () => async () => "No scan function registered."
  )

  const handleSubmit = async () => {
    setIsLoading(true)
    setOutput("")
    
    try {
      const result = await scanFn()
      setOutput(result)
    } catch (err) {
      setOutput(`Scan failed: ${String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const registerScan = useCallback((fn: () => Promise<string>) => {
    setScanFn(() => fn)
  }, [])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full max-w-screen rounded-lg border"
    >
      {/* Left Panel - Tool Options */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="flex h-full flex-col">
          <ScrollArea className="flex-1 p-6">
            <ToolOptions activeTool={activeTool} onRegisterScan={registerScan} />
          </ScrollArea>
          {activeTool && (
            <div className="border-t p-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Submit Scan"
                )}
              </Button>
            </div>
          )}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      {/* Right Panel - Output */}
      <ResizablePanel defaultSize={50}>
        <OutputPanel output={output} isLoading={isLoading} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}