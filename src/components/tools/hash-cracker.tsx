// components/tools/hash-cracker.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Key, ChevronDown, ChevronRight, Hash } from "lucide-react"
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

export function HashCracker({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const [hash, setHash] = useState("")
  const [options, setOptions] = useState({
    hashType: "auto",
    attackMode: "straight",
    wordlist: "rockyou",
    rules: "",
    workload: "3",
    potfile: false,
    customWordlist: ""
  })
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onRegisterScan(async () => {
      if (!hash) {
        throw new Error("Please enter a hash to crack")
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

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/payload-crafting/hash-cracker", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            hash,
            hashType: options.hashType,
            wordlist: options.wordlist === "custom" ? options.customWordlist : options.wordlist,
            attackMode: options.attackMode,
            rulesFile: options.rules,
            workload: options.workload,
            usepotfile: options.potfile
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Hash cracking failed")
        }

        const result = await response.json()
        return typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)
      } catch (err) {
        console.error("Hash cracking error:", err)
        throw err
      } finally {
        setIsLoading(false)
      }
    })
  }, [hash, options, onRegisterScan])

  const attackModes = [
    { value: "straight", label: "Straight (Dictionary)" },
    { value: "combination", label: "Combination" },
    { value: "brute", label: "Brute-force" },
    { value: "hybrid_wm", label: "Hybrid Wordlist + Mask" },
    { value: "hybrid_mw", label: "Hybrid Mask + Wordlist" },
  ]

  const hashTypes = [
    { value: "auto", label: "Auto-detect" },
    { value: "ntlm", label: "NTLM" },
    { value: "sha256", label: "SHA-256" },
    { value: "sha512", label: "SHA-512" },
    { value: "wpa", label: "WPA-PBKDF2-PMKID+EAPOL" },
    { value: "django", label: "Django (PBKDF2-SHA256)" },
    { value: "sha512crypt", label: "sha512crypt $6$, SHA512 (Unix)" },
  ]

  const wordlists = [
    { value: "rockyou", label: "RockYou (14M entries)" },
    { value: "crackstation", label: "CrackStation (15M entries)" },
    { value: "weakpass", label: "Weakpass (5M entries)" },
    { value: "custom", label: "Custom path..." },
  ]

  const workloads = [
    { value: "1", label: "Low (Slower)" },
    { value: "2", label: "Default" },
    { value: "3", label: "High (Faster)" },
    { value: "4", label: "Nightmare (Max)" },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Hash Cracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="hash">Hash to Crack</Label>
            <Input
              id="hash"
              placeholder="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Hash Type</Label>
            <Select 
              value={options.hashType} 
              onValueChange={(value) => setOptions({...options, hashType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hash type" />
              </SelectTrigger>
              <SelectContent>
                {hashTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Attack Mode</Label>
            <Select 
              value={options.attackMode} 
              onValueChange={(value) => setOptions({...options, attackMode: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select attack mode" />
              </SelectTrigger>
              <SelectContent>
                {attackModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {options.attackMode !== "brute" && (
            <>
              <div className="space-y-2">
                <Label>Wordlist</Label>
                <Select 
                  value={options.wordlist} 
                  onValueChange={(value) => setOptions({...options, wordlist: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select wordlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {wordlists.map((list) => (
                      <SelectItem key={list.value} value={list.value}>
                        {list.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {options.wordlist === "custom" && (
                <div className="space-y-2">
                  <Label>Custom Wordlist Path</Label>
                  <Input
                    placeholder="/path/to/wordlist.txt"
                    value={options.customWordlist}
                    onChange={(e) => setOptions({...options, customWordlist: e.target.value})}
                  />
                </div>
              )}
            </>
          )}
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
                  <Label htmlFor="rules">Rules File (optional)</Label>
                  <Input
                    id="rules"
                    placeholder="d3ad0ne.rule"
                    value={options.rules}
                    onChange={(e) => setOptions({...options, rules: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Workload Profile</Label>
                  <Select 
                    value={options.workload} 
                    onValueChange={(value) => setOptions({...options, workload: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select workload" />
                    </SelectTrigger>
                    <SelectContent>
                      {workloads.map((wl) => (
                        <SelectItem key={wl.value} value={wl.value}>
                          {wl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="potfile"
                    checked={options.potfile}
                    onCheckedChange={(checked) => setOptions({...options, potfile: checked})}
                  />
                  <Label htmlFor="potfile">Use Potfile</Label>
                </div>

                {options.attackMode === "brute" && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="mask">Brute-force Mask</Label>
                    <Input
                      id="mask"
                      placeholder="?l?l?l?l?l?l?l?l"
                      value="?1?1?1?1?1?1?1?1"
                      onChange={() => { }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Custom character sets: ?l (lower), ?u (upper), ?d (digit), ?s (special)
                    </p>
                  </div>
                )}
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