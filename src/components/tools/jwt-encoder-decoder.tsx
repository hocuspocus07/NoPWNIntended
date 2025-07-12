"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Key, Lock, Unlock, Copy, Check } from "lucide-react"
import * as jwt from 'jsonwebtoken'

export function JwtTool() {
    const [activeTab, setActiveTab] = useState<"decode" | "encode">("decode")
    const [jwtToken, setJwtToken] = useState("")
    const [decoded, setDecoded] = useState({ header: "", payload: "" })
    const [secret, setSecret] = useState("your-256-bit-secret")
    const [copied, setCopied] = useState<string | null>(null)
    const [isValid, setIsValid] = useState<boolean | null>(null)

    // Copy to clipboard
    const copyToClipboard = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text)
        setCopied(fieldName)
        setTimeout(() => setCopied(null), 2000)
    }

    // Decode JWT
    const decodeJwt = () => {
        if (!jwtToken) {
            setDecoded({ header: "", payload: "" })
            setIsValid(null)
            return
        }

        try {
            const [headerBase64, payloadBase64] = jwtToken.split('.')
            const header = JSON.parse(atob(headerBase64))
            const payload = JSON.parse(atob(payloadBase64))

            setDecoded({
                header: JSON.stringify(header, null, 2),
                payload: JSON.stringify(payload, null, 2)
            })

            // Try to verify if we have a secret
            if (secret) {
                try {
                    jwt.verify(jwtToken, secret)
                    setIsValid(true)
                } catch {
                    setIsValid(false)
                }
            } else {
                setIsValid(null)
            }
        } catch (err) {
            setDecoded({
                header: `Error: ${err instanceof Error ? err.message : 'Invalid JWT'}`,
                payload: ""
            })
            setIsValid(false)
        }
    }

    // Encode JWT
    const encodeJwt = () => {
        try {
            const header = decoded.header ? JSON.parse(decoded.header) : { alg: "HS256", typ: "JWT" }
            const payload = decoded.payload ? JSON.parse(decoded.payload) : { sub: "1234567890" }

            const token = jwt.sign(payload, secret, {
                ...header,
                algorithm: header.alg || "HS256"
            })

            setJwtToken(token)
        } catch (err) {
            setJwtToken(`Error: ${err instanceof Error ? err.message : 'Encoding failed'}`)
        }
    }

    // Auto-decode when token changes
    useEffect(() => {
        if (activeTab === "decode") {
            decodeJwt()
        }
    }, [jwtToken, secret, activeTab])

    // Switch tabs handler
    const handleTabChange = (tab: "decode" | "encode") => {
        if (tab === "encode" && decoded.header && decoded.payload) {
            encodeJwt()
        }
        setActiveTab(tab)
    }

    return (
        <Card className="w-full h-full max-w-2xl mx-auto flex flex-col overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    JWT Tool
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                        if (value === "decode" || value === "encode") {
                            handleTabChange(value)
                        }
                    }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                        <TabsTrigger value="decode">
                            <Unlock className="h-4 w-4 mr-2" />
                            Decode
                        </TabsTrigger>
                        <TabsTrigger value="encode">
                            <Lock className="h-4 w-4 mr-2" />
                            Encode
                        </TabsTrigger>
                    </TabsList>

                    {/* Decode Tab */}
                    <TabsContent value="decode" className="flex-1 flex flex-col min-h-0 overflow-auto space-y-4 w-full">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>JWT Token</Label>
                                {jwtToken && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(jwtToken, 'token')}
                                    >
                                        {copied === 'token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                placeholder="Enter JWT token..."
                                value={jwtToken}
                                onChange={(e) => setJwtToken(e.target.value)}
                                className="min-h-[80px] max-h-40 font-mono resize-none"
                                style={{ overflow: "auto" }}
                            />
                        </div>

                        {isValid !== null && (
                            <div className={`p-2 rounded-md text-sm ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {isValid ? "✓ Signature is valid" : "✗ Signature is invalid"}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Secret Key (for verification)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    placeholder="Enter your secret key"
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => copyToClipboard(secret, 'secret')}
                                >
                                    {copied === 'secret' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Header</Label>
                                    {decoded.header && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(decoded.header, 'header')}
                                        >
                                            {copied === 'header' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                                <Textarea
                                    readOnly
                                    value={decoded.header}
                                    className="min-h-[80px] max-h-40 font-mono resize-none"
                                    style={{ overflow: "auto" }}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Payload</Label>
                                    {decoded.payload && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(decoded.payload, 'payload')}
                                        >
                                            {copied === 'payload' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                                <Textarea
                                    readOnly
                                    value={decoded.payload}
                                    className="min-h-[80px] max-h-40 font-mono resize-none"
                                    style={{ overflow: "auto" }}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Encode Tab */}
                    <TabsContent value="encode" className="flex-1 flex flex-col min-h-0 overflow-auto space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Header</Label>
                                    {decoded.header && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(decoded.header, 'header')}
                                        >
                                            {copied === 'header' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                                <Textarea
                                    value={decoded.header}
                                    onChange={(e) => setDecoded({ ...decoded, header: e.target.value })}
                                    className="min-h-[80px] max-h-40 font-mono resize-none"
                                    placeholder='{\n  "alg": "HS256",\n  "typ": "JWT"\n}'
                                    style={{ overflow: "auto" }}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Payload</Label>
                                    {decoded.payload && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(decoded.payload, 'payload')}
                                        >
                                            {copied === 'payload' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                                <Textarea
                                    value={decoded.payload}
                                    onChange={(e) => setDecoded({ ...decoded, payload: e.target.value })}
                                    className="min-h-[80px] max-h-40 font-mono resize-none"
                                    placeholder='{\n  "sub": "1234567890",\n  "name": "John Doe"\n}'
                                    style={{ overflow: "auto" }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Secret Key</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    placeholder="Enter your secret key"
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => copyToClipboard(secret, 'secret')}
                                >
                                    {copied === 'secret' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <Button onClick={encodeJwt} className="w-full">
                            Generate JWT
                        </Button>

                        {jwtToken && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Generated Token</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(jwtToken, 'token')}
                                    >
                                        {copied === 'token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <Textarea
                                    readOnly
                                    value={jwtToken}
                                    className="min-h-[80px] max-h-40 font-mono resize-none"
                                    style={{ overflow: "auto" }}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}