"use client"
import { useState, useCallback, useEffect } from "react"
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
import { useIsMobile } from "@/hooks/use-mobile"

export function MainSection({ activeTool }: { activeTool: string | null, activeToolTitle?: string | null }) {
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [scanFn, setScanFn] = useState<() => Promise<string>>(
    () => async () => "No scan function registered."
  )
  const [showOutput, setShowOutput] = useState(false)
  const isMobile = useIsMobile()

  const handleSubmit = async () => {
    setIsLoading(true)
    setOutput("")
    
    try {
      const result = await scanFn()
      setOutput(result)
      if (isMobile) {
        setShowOutput(true) // Show output panel on mobile after scan completes
      }
    } catch (err) {
      setOutput(`Scan failed: ${String(err)}`)
      if (isMobile) {
        setShowOutput(true) // Show output panel even if scan fails
      }
    } finally {
      setIsLoading(false)
    }
  }

  const registerScan = useCallback((fn: () => Promise<string>) => {
    setScanFn(() => fn)
  }, [])

  // Reset view when active tool changes on mobile
  useEffect(() => {
    if (isMobile && activeTool) {
      setShowOutput(false)
    }
  }, [activeTool, isMobile])

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
        {!showOutput ? (
          <div className="flex h-full flex-col overflow-hidden">
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
        ) : (
          <div className="h-full">
            <Button 
              variant="ghost" 
              onClick={() => setShowOutput(false)}
              className="m-2"
            >
              ← Back to Tool
            </Button>
            <OutputPanel output={output} isLoading={isLoading} />
          </div>
        )}
      </div>
    )
  }

  /* Desktop Layout*/
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[calc(100vh-4rem)] w-full overflow-hidden rounded-lg border"
    >
      {/* Left Panel - Tool Options */}
      <ResizablePanel defaultSize={50} minSize={30} className="overflow-hidden">
        <div className="flex h-full flex-col overflow-hidden">
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
      <ResizablePanel defaultSize={50} className="overflow-hidden">
        <OutputPanel output={output} isLoading={isLoading} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}