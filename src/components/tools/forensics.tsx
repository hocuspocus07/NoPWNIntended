"use client"
import { FilePreview } from "../filePreview"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Search, HardDriveDownload, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ForensicsTool({ onRegisterScan }: { onRegisterScan: (fn: () => Promise<string>) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tool, setTool] = useState("tsk")
  const [tskCommand, setTskCommand] = useState("fls")
  const [error, setError] = useState<string | null>(null)
  const [entropyScan, setEntropyScan] = useState(false)
  const [foremostConfig, setForemostConfig] = useState("")
  const [binwalkExtract, setBinwalkExtract] = useState(true)
  const [partitionType, setPartitionType] = useState("auto")
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [inode, setInode] = useState("1")

  const forensicsTools = [
    { value: "tsk", label: "The Sleuth Kit (TSK)" },
    { value: "binwalk", label: "binwalk" },
    { value: "foremost", label: "foremost" },
    { value: "testdisk", label: "testdisk" },
  ]

  const tskCommands = [
    { value: "fls", label: "fls (List Files)" },
    { value: "icat", label: "icat (Extract File by Inode)" },
    { value: "mmls", label: "mmls (Partition Table)" },
  ]

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }, [])

  useEffect(() => {
    onRegisterScan(async () => {
      if (!file) {
        throw new Error("Please select a disk image file")
      }

      try {
        const formData = new FormData()
        formData.append("file", file)

        let endpoint = ""

        switch (tool) {
          case "tsk":
            endpoint = "/api/misc/forensics/tsk"
            formData.append("command", tskCommand)
            if (tskCommand === "icat") {
              formData.append("inode", inode)
            }
            break
          case "binwalk":
            endpoint = "/api/misc/forensics/binwalk"
            formData.append("entropyScan", String(entropyScan))
            formData.append("extractFiles", String(binwalkExtract))
            break
          case "foremost":
            endpoint = "/api/misc/forensics/foremost"
            if (foremostConfig) {
              formData.append("configFile", foremostConfig)
            }
            break
          case "testdisk":
            endpoint = "/api/misc/forensics/testdisk"
            formData.append("partitionType", partitionType)
            break
        }

        // Get the auth token
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

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Request failed")
        }

        const data = await response.json()
        return data.output || "No output received"
      } catch (err) {
        console.error("Forensics error:", err)
        throw err
      }
    })
  }, [file, tool, tskCommand, inode, entropyScan, binwalkExtract, foremostConfig, partitionType, onRegisterScan])

  const hasAdvancedOptions = ["binwalk", "testdisk"].includes(tool)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDriveDownload className="h-5 w-5" />
          Disk Image Forensics Toolkit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Disk Image File</Label>
            {file ? (
              <FilePreview file={file} onRemove={() => setFile(null)} />
            ) : (
              <div
                className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-gray-300"
                  }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="mb-2 h-8 w-8 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  Drag & drop a disk image here, or click to select
                </p>
                <Button variant="outline" size="sm" className="relative">
                  Select File
                  <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    accept=".dd,.img,.iso,.bin,.raw,.e01,.aff"
                  />
                </Button>
              </div>
            )}

          </div>
          <div className="space-y-2">
            <Label>Tool</Label>
            <Select value={tool} onValueChange={setTool}>
              <SelectTrigger>
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent>
                {forensicsTools.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tool === "tsk" && (
            <div className="space-y-2">
              <Label>TSK Command</Label>
              <Select value={tskCommand} onValueChange={setTskCommand}>
                <SelectTrigger>
                  <SelectValue placeholder="Command" />
                </SelectTrigger>
                <SelectContent>
                  {tskCommands.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {tool === "tsk" && tskCommand === "icat" && (
            <div className="space-y-2">
              <Label htmlFor="inode">Inode Number</Label>
              <input
                id="inode"
                type="text"
                value={inode}
                onChange={(e) => setInode(e.target.value)}
                placeholder="Enter inode number"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
          {tool === "foremost" && (
            <div className="space-y-2">
              <Label htmlFor="foremostConfig">Foremost Config (optional)</Label>
              <input
                id="foremostConfig"
                placeholder="/etc/foremost.conf"
                value={foremostConfig}
                onChange={(e) => setForemostConfig(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
        </div>

        {hasAdvancedOptions && (
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
                {tool === "binwalk" && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="binwalkExtract"
                        checked={binwalkExtract}
                        onCheckedChange={setBinwalkExtract}
                      />
                      <Label htmlFor="binwalkExtract">Auto-extract files (-e)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="entropyScan"
                        checked={entropyScan}
                        onCheckedChange={setEntropyScan}
                      />
                      <Label htmlFor="entropyScan">Entropy scan (-E)</Label>
                    </div>
                  </>
                )}
                {tool === "testdisk" && (
                  <div className="space-y-2">
                    <Label htmlFor="partitionType">Partition Type</Label>
                    <input
                      id="partitionType"
                      placeholder="auto, intel, gpt, mac, etc."
                      value={partitionType}
                      onChange={e => setPartitionType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}