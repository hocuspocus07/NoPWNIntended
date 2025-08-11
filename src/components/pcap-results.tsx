"use client"

import { useState, useMemo } from "react"
import type { PcapAnalysisResult } from "@/lib/runners/runPcap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

interface PcapResultsProps {
  results: PcapAnalysisResult
}

function getTimeOfDay(s?: string) {
  if (!s) return "—"
  const m = s.match(/(\d{2}:\d{2}:\d{2})/)
  if (m?.[1]) return m[1]
  const parts = s.split(/\s+/)
  return parts[4] || s
}

function formatByteSize(bytes: number) {
  if (!bytes || bytes <= 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default function PcapResults({ results }: PcapResultsProps) {
  const isMobile = useIsMobile()
  const [packetFilter, setPacketFilter] = useState("")
  const [streamFilter, setStreamFilter] = useState("")
  const [selectedPacket, setSelectedPacket] = useState<(typeof results.packets)[0] | null>(null)
  const [selectedStream, setSelectedStream] = useState<(typeof results.streams)[0] | null>(null)

  const filteredPackets = useMemo(() => {
    if (!packetFilter) return results.packets
    const lower = packetFilter.toLowerCase()
    return results.packets.filter(
      (p) =>
        p.info.toLowerCase().includes(lower) ||
        p.protocol.toLowerCase().includes(lower) ||
        (p.src_ip && p.src_ip.toLowerCase().includes(lower)) ||
        (p.dst_ip && p.dst_ip.toLowerCase().includes(lower)) ||
        (p.raw_data && p.raw_data.toLowerCase().includes(lower)),
    )
  }, [results.packets, packetFilter])

  const filteredStreams = useMemo(() => {
    if (!streamFilter) return results.streams
    const lower = streamFilter.toLowerCase()
    return results.streams.filter(
      (s) =>
        s.protocol.toLowerCase().includes(lower) ||
        s.src_ip.toLowerCase().includes(lower) ||
        s.dst_ip.toLowerCase().includes(lower) ||
        s.content.toLowerCase().includes(lower),
    )
  }, [results.streams, streamFilter])

  const tableHeight = isMobile ? "h-[60vh]" : "h-[400px]"

  return (
    <TooltipProvider>
      <div className="space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className={isMobile ? "text-sm" : ""}>
              <p className="text-sm text-muted-foreground">Packet Count</p>
              <p className="font-semibold">{results.summary.packet_count}</p>
            </div>
            <div className={isMobile ? "text-sm" : ""}>
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="font-semibold">{formatByteSize(results.summary.file_size_bytes)}</p>
            </div>
            <div className={isMobile ? "text-sm" : ""}>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">
                {typeof results.summary.duration_seconds === "number"
                  ? results.summary.duration_seconds.toFixed(2)
                  : "N/A"}{" "}
                seconds
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm text-muted-foreground">Start Time</p>
              <p className="font-semibold truncate" title={results.summary.start_time}>
                {results.summary.start_time}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm text-muted-foreground">End Time</p>
              <p className="font-semibold truncate" title={results.summary.end_time}>
                {results.summary.end_time}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm text-muted-foreground">Top Protocols</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(results.summary.protocols || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([proto, count]) => (
                    <Badge key={proto} variant="secondary" className="text-xs">
                      {proto} ({count})
                    </Badge>
                  ))}
                {Object.keys(results.summary.protocols || {}).length > 5 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help text-xs">
                        +{Object.keys(results.summary.protocols || {}).length - 5} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1 text-xs">
                        {Object.entries(results.summary.protocols || {})
                          .sort(([, a], [, b]) => b - a)
                          .slice(5)
                          .map(([proto, count]) => (
                            <div key={proto}>
                              {proto} ({count})
                            </div>
                          ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="packets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="packets">Packets</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="flags">Flags</TabsTrigger>
          </TabsList>

          <TabsContent value="packets">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  Packets
                  <Input
                    placeholder="Filter packets..."
                    value={packetFilter}
                    onChange={(e) => setPacketFilter(e.target.value)}
                    className="w-full sm:max-w-xs"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className={`${tableHeight} w-full`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[56px]">No.</TableHead>
                        <TableHead className="w-[80px]">Time</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Destination</TableHead>
                        {!isMobile && <TableHead>Protocol</TableHead>}
                        {!isMobile && <TableHead>Length</TableHead>}
                        <TableHead>Info</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPackets.length > 0 ? (
                        filteredPackets.map((packet) => (
                          <TableRow
                            key={packet.number}
                            onClick={() => setSelectedPacket(packet)}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="text-xs sm:text-sm">{packet.number}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{getTimeOfDay(packet.time)}</TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {(packet.src_ip || "N/A") + (packet.src_port ? `:${packet.src_port}` : "")}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {(packet.dst_ip || "N/A") + (packet.dst_port ? `:${packet.dst_port}` : "")}
                            </TableCell>
                            {!isMobile && <TableCell>{packet.protocol}</TableCell>}
                            {!isMobile && <TableCell>{packet.length}</TableCell>}
                            <TableCell className="max-w-[140px] sm:max-w-[240px] truncate text-xs sm:text-sm">
                              {isMobile && packet.protocol ? (
                                <span className="inline-flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px]">
                                    {packet.protocol}
                                  </Badge>
                                  <span className="truncate">{packet.info || "—"}</span>
                                </span>
                              ) : (
                                packet.info || "—"
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No packets found matching the filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streams">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  Streams
                  <Input
                    placeholder="Filter streams..."
                    value={streamFilter}
                    onChange={(e) => setStreamFilter(e.target.value)}
                    className="w-full sm:max-w-xs"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className={`${tableHeight} w-full`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[56px]">ID</TableHead>
                        {!isMobile && <TableHead>Protocol</TableHead>}
                        <TableHead>Source</TableHead>
                        <TableHead>Destination</TableHead>
                        {!isMobile && <TableHead>Packets</TableHead>}
                        {!isMobile && <TableHead>Bytes</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStreams.length > 0 ? (
                        filteredStreams.map((stream) => (
                          <TableRow
                            key={stream.id}
                            onClick={() => setSelectedStream(stream)}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="text-xs sm:text-sm">{stream.id}</TableCell>
                            {!isMobile && <TableCell>{stream.protocol}</TableCell>}
                            <TableCell className="text-xs sm:text-sm">
                              {(stream.src_ip || "N/A") + (stream.src_port ? `:${stream.src_port}` : "")}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">
                              {(stream.dst_ip || "N/A") + (stream.dst_port ? `:${stream.dst_port}` : "")}
                            </TableCell>
                            {!isMobile && <TableCell>{stream.packets}</TableCell>}
                            {!isMobile && <TableCell>{stream.bytes}</TableCell>}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No streams found matching the filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                {results.credentials && results.credentials.length > 0 ? (
                  <ScrollArea className={`${tableHeight} w-full`}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Type</TableHead>
                          {!isMobile && <TableHead>Protocol</TableHead>}
                          <TableHead>Source</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Password</TableHead>
                          {!isMobile && <TableHead>Details</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.credentials.map((cred, index) => (
                          <TableRow key={index}>
                            <TableCell>{cred.type}</TableCell>
                            {!isMobile && <TableCell>{cred.protocol}</TableCell>}
                            <TableCell className="text-xs sm:text-sm">{cred.source}</TableCell>
                            <TableCell className="text-xs sm:text-sm">{cred.destination}</TableCell>
                            <TableCell className="font-mono text-xs sm:text-sm">{cred.username || "N/A"}</TableCell>
                            <TableCell className="font-mono text-xs sm:text-sm">{cred.password || "N/A"}</TableCell>
                            {!isMobile && (
                              <TableCell className="max-w-[200px] truncate">{cred.details || "N/A"}</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground p-4">No credentials extracted.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flags">
            <Card>
              <CardHeader>
                <CardTitle>Extracted CTF Flags</CardTitle>
              </CardHeader>
              <CardContent>
                {results.flags && results.flags.length > 0 ? (
                  <ScrollArea className={`${tableHeight} w-full`}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Flag Value</TableHead>
                          {!isMobile && <TableHead>Source Stream ID</TableHead>}
                          <TableHead>Source Packet No.</TableHead>
                          {!isMobile && <TableHead>Context</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.flags.map((flag, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono max-w-[200px] truncate">{flag.value}</TableCell>
                            {!isMobile && <TableCell>{flag.source_stream_id || "N/A"}</TableCell>}
                            <TableCell>{flag.source_packet_number || "N/A"}</TableCell>
                            {!isMobile && (
                              <TableCell className="max-w-[240px] truncate">{flag.context || "N/A"}</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground p-4">No CTF flags extracted.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Packet Detail Dialog */}
        <Dialog open={!!selectedPacket} onOpenChange={() => setSelectedPacket(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Packet Details (No. {selectedPacket?.number})</DialogTitle>
              <DialogDescription>
                Protocol: {selectedPacket?.protocol}, Length: {selectedPacket?.length}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-y-auto pr-4 -mr-4">
              <div className="space-y-4 text-sm p-1">
                <p>
                  <strong>Time:</strong> {selectedPacket?.time}
                </p>
                <p>
                  <strong>Source:</strong>{" "}
                  {(selectedPacket?.src_ip || "N/A") + (selectedPacket?.src_port ? `:${selectedPacket?.src_port}` : "")}
                </p>
                <p>
                  <strong>Destination:</strong>{" "}
                  {(selectedPacket?.dst_ip || "N/A") + (selectedPacket?.dst_port ? `:${selectedPacket?.dst_port}` : "")}
                </p>
                <p>
                  <strong>Info:</strong> {selectedPacket?.info || "—"}
                </p>
                {selectedPacket?.raw_data && (
                  <>
                    <h4 className="font-semibold mt-4">Raw Data (Hex Dump)</h4>
                    <pre className="whitespace-pre-wrap break-all text-xs bg-muted p-2 rounded-md">
                      {selectedPacket.raw_data.match(/.{1,48}/g)?.join("\n") || selectedPacket.raw_data}
                    </pre>
                  </>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Stream Detail Dialog */}
        <Dialog open={!!selectedStream} onOpenChange={() => setSelectedStream(null)}>
          <DialogContent className="sm:max-w:[800px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Stream Details (ID {selectedStream?.id})</DialogTitle>
              <DialogDescription>
                Protocol: {selectedStream?.protocol},{" "}
                {(selectedStream?.src_ip || "N/A") + (selectedStream?.src_port ? `:${selectedStream?.src_port}` : "")} ↔{" "}
                {(selectedStream?.dst_ip || "N/A") + (selectedStream?.dst_port ? `:${selectedStream?.dst_port}` : "")}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-y-auto pr-4 -mr-4">
              <div className="space-y-4 text-sm p-1">
                <p>
                  <strong>Packets:</strong> {selectedStream?.packets}
                </p>
                <p>
                  <strong>Bytes:</strong> {selectedStream?.bytes}
                </p>
                <h4 className="font-semibold mt-4">Stream Content</h4>
                <pre className="whitespace-pre-wrap break-words text-xs bg-muted p-2 rounded-md">
                  {selectedStream?.content || "No content available or content is binary."}
                </pre>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
