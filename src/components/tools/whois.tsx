// components/tools/whois-panel.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

export function WhoisPanel() {
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [recursive, setRecursive] = useState(false)
  const [rawOutput, setRawOutput] = useState(false)

  const handleWhoisLookup = async () => {
    if (!domain.trim()) {
      toast("Please enter a domain to lookup")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("hi");
      //response
    } catch (err) {
      setError("Failed to fetch WHOIS data")
      toast("Failed to perform WHOIS lookup")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          WHOIS Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain Name</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-0"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            {advancedOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>Advanced Options</span>
          </Button>
          
          {advancedOpen && (
            <div className="rounded-md border p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recursive"
                    checked={recursive}
                    onCheckedChange={setRecursive}
                  />
                  <Label htmlFor="recursive">Recursive Lookup</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="raw-output"
                    checked={rawOutput}
                    onCheckedChange={setRawOutput}
                  />
                  <Label htmlFor="raw-output">Raw Output</Label>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}