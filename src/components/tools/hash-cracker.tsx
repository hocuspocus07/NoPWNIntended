// components/tools/hash-cracker.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Key, ChevronDown, ChevronRight, Hash } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function HashCracker({ onOutputChange }: {
    onOutputChange: (output: string) => void
}) {
    const [hash, setHash] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [advancedOpen, setAdvancedOpen] = useState(false)
    const [attackMode, setAttackMode] = useState("0") // Default straight attack
    const [hashType, setHashType] = useState("0") // Auto-detect
    const [wordlist, setWordlist] = useState("rockyou")
    const [rules, setRules] = useState("")
    const [potfile, setPotfile] = useState(false)
    const [workload, setWorkload] = useState("2") // Default workload
    const [outputBuffer, setOutputBuffer] = useState("") // Local buffer for output

    const attackModes = [
        { value: "0", label: "Straight (Dictionary)" },
        { value: "1", label: "Combination" },
        { value: "3", label: "Brute-force" },
        { value: "6", label: "Hybrid Wordlist + Mask" },
        { value: "7", label: "Hybrid Mask + Wordlist" },
    ]

    const hashTypes = [
        { value: "0", label: "Auto-detect" },
        { value: "1000", label: "NTLM" },
        { value: "1400", label: "SHA-256" },
        { value: "1700", label: "SHA-512" },
        { value: "22000", label: "WPA-PBKDF2-PMKID+EAPOL" },
        { value: "10000", label: "Django (PBKDF2-SHA256)" },
        { value: "1800", label: "sha512crypt $6$, SHA512 (Unix)" },
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

    const handleHashCrack = async () => {
        if (!hash.trim()) {
            toast("Please enter a hash to crack")
            return
        }

        setIsLoading(true)
        setError(null)
        setOutputBuffer("Starting hash cracking process...\n")
        onOutputChange("Starting hash cracking process...\n")
        try {
            let command = `hashcat -m ${hashType} -a ${attackMode} '${hash}'`

            if (attackMode !== "3") {
                command += ` ${wordlist === "custom" ? "path/to/custom_wordlist.txt" : `/wordlists/${wordlist}.txt`}`
            }

            if (rules) {
                command += ` -r ${rules}`
            }

            command += ` -w ${workload}`

            if (potfile) {
                command += ` --potfile-path=hashcat.potfile`
            }

            if (attackMode === "3") {
                command += ` -1 ?l?u?d?s ?1?1?1?1?1?1?1?1` // Default brute-force mask
            }

            console.log("Generated Hashcat command:", command)
            addToOutput(`Running: ${command}\n\n`)

            onOutputChange(`Running: ${command}\n\n`)

            const mockProgress = [
                "Session..........: hashcat",
                "Status...........: Running",
                "Hash.Name........: SHA-256",
                "Hash.Target......: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62...",
                "Time.Started.....: Thu Jan 01 00:00:00 2024 (10 secs)",
                "Time.Estimated...: Thu Jan 01 00:02:30 2024 (2 mins, 20 secs)",
                "Guess.Base.......: File (rockyou.txt)",
                "Guess.Mod........: Rules (d3ad0ne.rule)",
                "Speed.#1.........:   100.0 kH/s (0.02ms)",
                "Recovered........: 0/1 (0.00%) Digests",
                "Progress.........: 500000/14344385 (3.49%)",
                "Rejected.........: 0/500000 (0.00%)",
                "Restore.Point....: 491520/14344385 (3.43%)",
            ]

            for (const line of mockProgress) {
                await new Promise(resolve => setTimeout(resolve, 300))
                addToOutput(line + "\n")
            }

            await new Promise(resolve => setTimeout(resolve, 1000))
            addToOutput("\n5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8:password123\n\nStatus...........: Cracked\n")
            toast.success("Hash cracked successfully!")
        } catch (err) {
            setError("Failed to crack hash")
            addToOutput("Error: Failed to complete hash cracking process\n")
            toast.error("Failed to crack hash")
        } finally {
            setIsLoading(false)
        }
    }
    const addToOutput = (newOutput: string) => {
        setOutputBuffer(prev => {
            const updatedOutput = prev + newOutput
            onOutputChange(updatedOutput)
            return updatedOutput
        })
    }
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
                        <Select value={hashType} onValueChange={setHashType}>
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
                        <Select value={attackMode} onValueChange={setAttackMode}>
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

                    {attackMode !== "3" && (
                        <>
                            <div className="space-y-2">
                                <Label>Wordlist</Label>
                                <Select value={wordlist} onValueChange={setWordlist}>
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

                            {wordlist === "custom" && (
                                <div className="space-y-2">
                                    <Label>Custom Wordlist Path</Label>
                                    <Input
                                        placeholder="/path/to/wordlist.txt"
                                        onChange={(e) => setWordlist(e.target.value)}
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
                                        value={rules}
                                        onChange={(e) => setRules(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Workload Profile</Label>
                                    <Select value={workload} onValueChange={setWorkload}>
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
                                        checked={potfile}
                                        onCheckedChange={setPotfile}
                                    />
                                    <Label htmlFor="potfile">Use Potfile</Label>
                                </div>

                                {attackMode === "3" && (
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

                <Button
                    onClick={handleHashCrack}
                    disabled={isLoading || !hash.trim()}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cracking...
                        </>
                    ) : (
                        <>
                            <Key className="mr-2 h-4 w-4" />
                            Crack Hash
                        </>
                    )}
                </Button>

                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
                        {error}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}