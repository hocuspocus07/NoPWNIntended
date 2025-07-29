"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, ChevronDown, ChevronRight } from "lucide-react"
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

export function WebScanner({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const [url, setUrl] = useState("")
  const [options, setOptions] = useState({
    tool: "nikto" as "nikto" | "wpscan" | "skipfish",
    aggressiveness: "medium" as "low" | "medium" | "high" | "insane",
    scanHidden: false
  })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

   useEffect(() => {
  onRegisterScan(async () => {
    if (!url.trim()) {
      throw new Error("Please enter a target URL");
    }

    // Validate URL format
    if (!url.match(/^https?:\/\/[^\s\/$.?#].[^\s]*$/i)) {
      throw new Error("Invalid URL format. Must start with http:// or https://");
    }

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

    setIsLoading(true);
    setError(null);

    try {
      let endpoint = "";
      let body: any = { target: url };
      
      switch(options.tool) {
        case "nikto":
          endpoint = "/api/vuln-assessment/web-scanner/nikto";
          body = { 
            target: url,
            aggressiveness: options.aggressiveness 
          };
          break;
        case "wpscan":
          endpoint = "/api/vuln-assessment/web-scanner/wpscan";
          body = { 
            target: url,
            scanOpts: {
              scanHidden: options.scanHidden,
              aggressiveness: options.aggressiveness
            }
          };
          break;
        case "skipfish":
          endpoint = "/api/vuln-assessment/web-scanner/skipfish";
          body = { 
            target: url,
            aggressiveness: options.aggressiveness 
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Web scan failed");
      }

      const result = await response.json();
      
      // // Handle Skipfish response differently
      // if (options.tool === "skipfish") {
      //   return JSON.stringify({
      //     output: result.data.output,
      //     reportContent: result.data.reportContent,
      //     tool: "skipfish"
      //   });
      // }
      
      // Default return for other tools
      return JSON.stringify({
        output: result.data,
        tool: options.tool
      });
      
    } catch (err) {
      console.error("Web scan error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  });
}, [url, options, onRegisterScan]);


  const tools = [
    { value: "nikto", label: "Nikto" },
    { value: "wpscan", label: "WPScan" },
    { value: "skipfish", label: "Skipfish" },
  ]

  const aggressivenessLevels = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "insane", label: "Insane" },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Web Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="url">Target URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Scanner Tool</Label>
            <Select 
              value={options.tool} 
              onValueChange={(value) => setOptions({
                ...options,
                tool: value as typeof options.tool
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                {tools.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
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
                <div className="space-y-2">
                  <Label>Aggressiveness</Label>
                  <Select 
                    value={options.aggressiveness} 
                    onValueChange={(value) => setOptions({
                      ...options,
                      aggressiveness: value as typeof options.aggressiveness
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {aggressivenessLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="scan-hidden"
                    checked={options.scanHidden}
                    onCheckedChange={(checked) => setOptions({
                      ...options,
                      scanHidden: checked
                    })}
                    disabled={options.tool !== "wpscan"}
                  />
                  <Label htmlFor="scan-hidden">
                    {options.tool === "wpscan" ? "Scan Hidden" : "Scan Hidden (WPScan only)"}
                  </Label>
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