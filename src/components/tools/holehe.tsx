"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Search, Loader2, ChevronDown, ChevronRight, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect } from "react"

export function HoleheTool({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const [email, setEmail] = useState("")
  const [options, setOptions] = useState({
    onlyUsed: false,
    verbose: false,
    timeout: 5,
    exclude: "",
    outputFormat: "text",
  })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const outputFormats = [
    { value: "text", label: "Text" },
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
  ]

   useEffect(() => {
    onRegisterScan(async () => {
      if (!email) {
        throw new Error("Please enter an email address")
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid email address")
      }

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

      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch("/api/osint/holehe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            email,
            options
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Email check failed")
        }

        const result = await response.json()
        return typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)
      } catch (err) {
        console.error("Holehe error:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    })
  }, [email, options, onRegisterScan])


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Email Breach Checker (Holehe)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select 
              value={options.outputFormat} 
              onValueChange={(value) => setOptions({...options, outputFormat: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {outputFormats.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-0"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            {advancedOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span>Advanced Options</span>
          </Button>
          {advancedOpen && (
            <div className="rounded-md border p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="only-used" 
                  checked={options.onlyUsed}
                  onCheckedChange={(checked) => setOptions({...options, onlyUsed: checked})}
                />
                <Label htmlFor="only-used">Only show used accounts</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="verbose" 
                  checked={options.verbose}
                  onCheckedChange={(checked) => setOptions({...options, verbose: checked})}
                />
                <Label htmlFor="verbose">Verbose output</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (seconds)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1"
                  max="30"
                  value={options.timeout}
                  onChange={(e) => setOptions({...options, timeout: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exclude">Exclude services (comma separated)</Label>
                <Input
                  id="exclude"
                  placeholder="twitter,instagram"
                  value={options.exclude}
                  onChange={(e) => setOptions({...options, exclude: e.target.value})}
                />
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