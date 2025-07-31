"use client"

import { useState, useCallback, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import ToolOptions from "./tool-options"
import { OutputPanel } from "./output-panel"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export function MainSection({ activeTool }: { activeTool: string | null; activeToolTitle?: string | null }) {
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scanFn, setScanFn] = useState<() => Promise<string>>(() => async () => "No scan function registered.")
  const [showOutput, setShowOutput] = useState(false)
  const isMobile = useIsMobile()

  const clearOutput = useCallback(() => {
    setOutput("")
    setShowOutput(false)
  }, [])

  useEffect(() => {
    clearOutput()
  }, [activeTool, clearOutput])

  const handleSubmit = async () => {
    setIsLoading(true)
    setOutput("")

    try {
      const result = await scanFn()
      setOutput(result)
      if (isMobile) {
        setShowOutput(true)
      }
    } catch (err) {
      setOutput(`Scan failed: ${String(err)}`)
      if (isMobile) {
        setShowOutput(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const registerScan = useCallback((fn: () => Promise<string>) => {
    setScanFn(() => fn)
  }, [])

  useEffect(() => {
    if (isMobile && activeTool) {
      setShowOutput(false)
    }
  }, [activeTool, isMobile])

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col overflow-hidden">
        {!showOutput ? (
          <>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <ToolOptions activeTool={activeTool} onRegisterScan={registerScan} onToolChange={clearOutput} />
                </div>
              </ScrollArea>
            </div>
            {activeTool && (
              <div className="border-t p-4 flex-shrink-0">
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
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
          </>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-2">
              <Button variant="ghost" onClick={() => setShowOutput(false)}>
                ← Back to Tool
              </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <OutputPanel output={output} isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>
    )
  }

  /* Desktop Layout*/
  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
        {/* Left Panel - Tool Options */}
        <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <ToolOptions activeTool={activeTool} onRegisterScan={registerScan} />
              </div>
            </ScrollArea>
          </div>
          {activeTool && (
            <div className="border-t p-4 flex-shrink-0">
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
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
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Output */}
        <ResizablePanel defaultSize={50} className="overflow-hidden">
          <OutputPanel output={output} isLoading={isLoading} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}