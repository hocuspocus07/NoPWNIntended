// components/tools/encoder-decoder.tsx
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Hash, LockKeyhole, Binary, Code } from "lucide-react"
import {
  encodeDecodeBase64,
  encodeDecodeUrl,
  encodeDecodeHtml,
  encodeDecodeHex,
  encodeDecodeBinary,
  hashMd5,
  hashSha1,
  hashSha256,
  rot13,
  encodeDecodeAscii,
  getAlgorithmIcon
} from "../../utils/encoding-helper"

export function EncoderDecoder({ onOutputChange }: { 
  onOutputChange: (output: string) => void 
}) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [operation, setOperation] = useState<"encode" | "decode">("encode")
  const [algorithm, setAlgorithm] = useState("base64")
  const [isProcessing, setIsProcessing] = useState(false)

  const operations = [
    { value: "encode", label: "Encode" },
    { value: "decode", label: "Decode" },
  ]

  const algorithms = [
    { value: "base64", label: "Base64" },
    { value: "url", label: "URL" },
    { value: "html", label: "HTML" },
    { value: "hex", label: "Hexadecimal" },
    { value: "binary", label: "Binary" },
    { value: "md5", label: "MD5" },
    { value: "sha1", label: "SHA-1" },
    { value: "sha256", label: "SHA-256" },
    { value: "rot13", label: "ROT13" },
    { value: "ascii", label: "ASCII Codes" },
  ]

  // Process input to output (encode/decode)
  const processInput = (value: string, fromInput: boolean) => {
    if (!value.trim()) {
      setOutput("")
      setInput("")
      onOutputChange("")
      return
    }

    setIsProcessing(true)
    try {
      let result = ""
      const currentOperation = fromInput ? operation : 
                            (operation === "encode" ? "decode" : "encode")

      switch(algorithm) {
        case "base64":
          result = encodeDecodeBase64(value, currentOperation)
          break
        case "url":
          result = encodeDecodeUrl(value, currentOperation)
          break
        case "html":
          result = encodeDecodeHtml(value, currentOperation)
          break
        case "hex":
          result = encodeDecodeHex(value, currentOperation)
          break
        case "binary":
          result = encodeDecodeBinary(value, currentOperation)
          break
        case "md5":
          // MD5 is one-way only
          result = fromInput ? hashMd5(value) : ""
          break
        case "sha1":
          // SHA-1 is one-way only
          result = fromInput ? hashSha1(value) : ""
          break
        case "sha256":
          // SHA-256 is one-way only
          result = fromInput ? hashSha256(value) : ""
          break
        case "rot13":
          // ROT13 is its own inverse
          result = rot13(value)
          break
        case "ascii":
          result = encodeDecodeAscii(value, currentOperation)
          break
        default:
          result = "Unsupported algorithm"
      }

      if (fromInput) {
        setOutput(result)
        onOutputChange(result)
      } else {
        setInput(result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (fromInput) {
        setOutput(`Error: ${errorMessage}`)
        onOutputChange(`Error: ${errorMessage}`)
      } else {
        setInput(`Error: ${errorMessage}`)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle input changes
  useEffect(() => {
    if (!isProcessing) {
      processInput(input, true)
    }
  }, [input, operation, algorithm])

  // Handle output changes
  const handleOutputChange = (value: string) => {
    if (!isProcessing) {
      setOutput(value)
      processInput(value, false)
    }
  }

  const renderAlgorithmIcon = () => {
    const iconName = getAlgorithmIcon(algorithm)
    switch(iconName) {
      case "Hash":
        return <Hash className="h-5 w-5" />
      case "LockKeyhole":
        return <LockKeyhole className="h-5 w-5" />
      case "Binary":
        return <Binary className="h-5 w-5" />
      default:
        return <Code className="h-5 w-5" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {renderAlgorithmIcon()}
          {operation === "encode" ? "Encoder" : "Decoder"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Operation</Label>
            <Select value={operation} onValueChange={(value: "encode" | "decode") => setOperation(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                {operations.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Algorithm</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger>
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                {algorithms.map((alg) => (
                  <SelectItem key={alg.value} value={alg.value}>
                    {alg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="input">
            {operation === "encode" ? "Text to encode" : "Text to decode"}
          </Label>
          <Textarea
            id="input"
            placeholder={
              operation === "encode" 
                ? "Enter text to encode..." 
                : "Enter encoded text..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {operation === "encode" ? "Encoded output" : "Decoded output"}
          </Label>
          <Textarea
            value={output}
            onChange={(e) => handleOutputChange(e.target.value)}
            className="min-h-[100px] font-mono"
            placeholder={
              operation === "encode" 
                ? "Encoded text will appear here..." 
                : "Decoded text will appear here..."
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}