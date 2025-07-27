"use client"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"

export function WhoisPanel({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [recursive, setRecursive] = useState(false)
  const [rawOutput, setRawOutput] = useState(false)

  useEffect(() => {
    onRegisterScan(async () => {
      if (!domain.trim()) {
        throw new Error("Please enter a domain to lookup")
      }

      // Validate domain format
      if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(domain)) {
        throw new Error("Please enter a valid domain name")
      }

      setIsLoading(true)
      setError(null)

      try {
        // Get the current session
        let token = localStorage.getItem("access_token");
      if (!token) {
        const supa = localStorage.getItem('sb-xkhhbysnfzdhkhbjtyut-auth-token');
        if (supa) {
          try {
            token = JSON.parse(supa).access_token;
          } catch (e) {
            token = null;
          }
        }
      }
      console.log("Token used for fetch:", token);
        const response = await fetch("/api/recon/whois", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            domain,
            scanOpts: {
              recursive,
              rawOutput
            }
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "WHOIS lookup failed")
        }

        const result = await response.json()
        return typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)
      } catch (err) {
        console.error("WHOIS error:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    })
  }, [domain, recursive, rawOutput, onRegisterScan])

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