import { execFile } from "child_process"
import util from "util"
import { tmpdir } from "os"
import fs from "fs/promises"
import crypto from "crypto"
import path from "path"

const asyncExecFile = util.promisify(execFile)

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: string | Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks)))
  })
}

export interface PcapAnalysisOptions {
  extractCredentials?: boolean
  extractFlags?: boolean
  filterExpression?: string
  showRawPackets?: boolean
}

export interface PcapAnalysisResult {
  summary: {
    packet_count: number
    start_time: string
    end_time: string
    duration_seconds: number
    file_size_bytes: number
    protocols: { [key: string]: number }
    top_talkers: { ip: string; packets: number; bytes: number }[]
  }
  streams: {
    id: number
    protocol: string
    src_ip: string
    src_port: number
    dst_ip: string
    dst_port: number
    packets: number
    bytes: number
    content: string
  }[]
  packets: {
    number: number
    time: string
    src_ip?: string
    dst_ip?: string
    src_port?: number | null
    dst_port?: number | null
    protocol: string
    length: number
    info: string
    raw_data?: string
  }[]
  credentials: {
    type: string
    protocol: string
    source: string
    destination: string
    username?: string
    password?: string
    details: string
    source_packet_number?: number
  }[]
  flags: {
    value: string
    source_packet_number?: number
    source_stream_id?: number
    context?: string
  }[]
  error?: string
}

async function runTsharkCommand(
  pcapFilePath: string,
  commandType: string,
  filterExpression?: string,
  showRawPackets?: boolean,
): Promise<string> {
  const container = process.env.NEXT_PUBLIC_CONTAINER_NAME
  if (!container) throw new Error("Docker container name not defined in NEXT_PUBLIC_CONTAINER_NAME.")

  const args = [
    "exec",
    container,
    "/docker/scripts/run-pcap.sh",
    pcapFilePath,
    commandType,
    filterExpression || "",
    String(showRawPackets || false),
  ]

  const { stdout, stderr } = await asyncExecFile("docker", args, {
    timeout: 600000,
    maxBuffer: 1024 * 1024 * 200,
  })

  if (stderr) {
    console.warn(`PCAP analysis script stderr for ${commandType}:`, stderr)
  }
  return stdout
}

// CSV parsing for separator=, and quote=d from tshark
function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let i = 0
  const n = line.length
  while (i < n) {
    if (line[i] === '"') {
      i++
      let start = i
      let buf = ""
      while (i < n) {
        if (line[i] === '"') {
          if (i + 1 < n && line[i + 1] === '"') {
            buf += line.slice(start, i) + '"'
            i += 2
            start = i
            continue
          } else {
            buf += line.slice(start, i)
            i++
            break
          }
        }
        i++
      }
      if (i < n && line[i] === ",") i++
      out.push(buf)
    } else {
      const j = line.indexOf(",", i)
      if (j === -1) {
        out.push(line.slice(i))
        break
      } else {
        out.push(line.slice(i, j))
        i = j + 1
      }
    }
  }
  return out
}

function parseEpochFromString(s?: string): number | undefined {
  if (!s) return
  const t = Date.parse(s)
  return Number.isNaN(t) ? undefined : t / 1000
}

export async function runPcapAnalysis(
  file: Buffer | NodeJS.ReadableStream,
  options: PcapAnalysisOptions = {},
): Promise<PcapAnalysisResult> {
  const fileBuffer = Buffer.isBuffer(file) ? file : await streamToBuffer(file)
  const tempName = `pcap_${crypto.randomUUID()}.pcap`
  const hostTempPath = path.join(tmpdir(), tempName)
  const containerPath = `/tmp/${tempName}`

  await fs.writeFile(hostTempPath, fileBuffer)

  const result: PcapAnalysisResult = {
    summary: {
      packet_count: 0,
      start_time: "N/A",
      end_time: "N/A",
      duration_seconds: 0,
      file_size_bytes: 0,
      protocols: {},
      top_talkers: [],
    },
    streams: [],
    packets: [],
    credentials: [],
    flags: [],
  }

  try {
    await asyncExecFile("docker", [
      "cp",
      hostTempPath,
      `${process.env.NEXT_PUBLIC_CONTAINER_NAME!}:${containerPath}`,
    ]).catch((e) => {
      console.error("Docker cp failed, attempting to proceed if file exists in container:", e)
    })

    const packetsCsv = await runTsharkCommand(
      containerPath,
      "packets",
      options.filterExpression,
      options.showRawPackets,
    )

    const lines = packetsCsv.split("\n").filter((l) => l.length > 0)
    if (lines.length > 0) {
      const header = parseCsvLine(lines[0])
      const idx = (name: string) => header.indexOf(name)

      const iNumber = idx("frame.number")
      const iTime = idx("frame.time")
      const iEpoch = idx("frame.time_epoch")
      const iIpSrc = idx("ip.src")
      const iIpDst = idx("ip.dst")
      const iIpv6Src = idx("ipv6.src")
      const iIpv6Dst = idx("ipv6.dst")
      const iTcpSrc = idx("tcp.srcport")
      const iTcpDst = idx("tcp.dstport")
      const iUdpSrc = idx("udp.srcport")
      const iUdpDst = idx("udp.dstport")
      const iProto = idx("_ws.col.Protocol")
      const iFrameProtocols = idx("frame.protocols")
      const iLenCol = idx("_ws.col.Length")
      const iFrameLen = idx("frame.len")
      const iInfo = idx("_ws.col.Info")
      const iData = idx("data.data")

      const packets: PcapAnalysisResult["packets"] = []
      let firstEpoch: number | undefined
      let lastEpoch: number | undefined

      for (let li = 1; li < lines.length; li++) {
        const cols = parseCsvLine(lines[li])
        if (cols.length === 0) continue

        const num = Number.parseInt(cols[iNumber] ?? "0", 10) || 0
        const time = cols[iTime] || "N/A"
        const epoch = Number.parseFloat(cols[iEpoch] || "")
        if (Number.isFinite(epoch)) {
          if (firstEpoch == null) firstEpoch = epoch
          lastEpoch = epoch
        }

        const ipSrc = cols[iIpSrc] || cols[iIpv6Src] || undefined
        const ipDst = cols[iIpDst] || cols[iIpv6Dst] || undefined

        const tcpSrc = Number.parseInt(cols[iTcpSrc] || "", 10)
        const tcpDst = Number.parseInt(cols[iTcpDst] || "", 10)
        const udpSrc = Number.parseInt(cols[iUdpSrc] || "", 10)
        const udpDst = Number.parseInt(cols[iUdpDst] || "", 10)

        // Protocol
        let protocol = cols[iProto] || ""
        if (!protocol) {
          const fp = cols[iFrameProtocols] || ""
          if (fp) {
            // fp like "eth:ethertype:ip:tcp:http" -> "http"
            const tail = fp.split(":").filter(Boolean).pop()
            if (tail) protocol = tail.toUpperCase()
          }
        }
        if (!protocol) {
          if (Number.isFinite(tcpSrc) || Number.isFinite(tcpDst)) protocol = "TCP"
          else if (Number.isFinite(udpSrc) || Number.isFinite(udpDst)) protocol = "UDP"
          else if (ipSrc || ipDst) protocol = "IP"
          else protocol = "N/A"
        }

        // Length: 
        const lengthCol = Number.parseInt(cols[iLenCol] || "", 10)
        const frameLen = Number.parseInt(cols[iFrameLen] || "", 10)
        const length = Number.isFinite(lengthCol) ? lengthCol : Number.isFinite(frameLen) ? frameLen : 0

        // Info: 
        let info = cols[iInfo] || ""
        if (!info) {
          if (protocol === "TCP" || Number.isFinite(tcpSrc) || Number.isFinite(tcpDst)) {
            const s = Number.isFinite(tcpSrc) ? tcpSrc : "?"
            const d = Number.isFinite(tcpDst) ? tcpDst : "?"
            info = `TCP ${s} → ${d}`
          } else if (protocol === "UDP" || Number.isFinite(udpSrc) || Number.isFinite(udpDst)) {
            const s = Number.isFinite(udpSrc) ? udpSrc : "?"
            const d = Number.isFinite(udpDst) ? udpDst : "?"
            info = `UDP ${s} → ${d}`
          } else if (ipSrc || ipDst) {
            info = `IP ${ipSrc || "?"} → ${ipDst || "?"}`
          } else {
            const fp = cols[iFrameProtocols] || ""
            info = fp || "N/A"
          }
        }

        const rawHex = cols[iData] || undefined

        packets.push({
          number: num,
          time,
          src_ip: ipSrc,
          dst_ip: ipDst,
          src_port: Number.isFinite(tcpSrc) ? tcpSrc : Number.isFinite(udpSrc) ? udpSrc : null,
          dst_port: Number.isFinite(tcpDst) ? tcpDst : Number.isFinite(udpDst) ? udpDst : null,
          protocol,
          length,
          info,
          raw_data: rawHex,
        })
      }

      result.packets = packets
      result.summary.packet_count = packets.length
      result.summary.file_size_bytes = fileBuffer.length
      if (packets.length > 0) {
        result.summary.start_time = packets[0].time || "N/A"
        result.summary.end_time = packets[packets.length - 1].time || "N/A"
      }
      if (firstEpoch != null && lastEpoch != null && lastEpoch >= firstEpoch) {
        result.summary.duration_seconds = Number((lastEpoch - firstEpoch).toFixed(6))
      } else if (packets.length > 0) {
        const se = parseEpochFromString(result.summary.start_time)
        const ee = parseEpochFromString(result.summary.end_time)
        result.summary.duration_seconds = se != null && ee != null && ee >= se ? ee - se : 0
      }

      const protoCounts = new Map<string, number>()
      for (const p of packets) {
        const key = (p.protocol || "N/A").toUpperCase()
        protoCounts.set(key, (protoCounts.get(key) || 0) + 1)
      }
      result.summary.protocols = Object.fromEntries(protoCounts.entries())

      // Top talkers
      const talkers = new Map<string, { ip: string; packets: number; bytes: number }>()
      for (const p of packets) {
        if (p.src_ip) {
          const t = talkers.get(p.src_ip) || { ip: p.src_ip, packets: 0, bytes: 0 }
          t.packets += 1
          t.bytes += p.length
          talkers.set(p.src_ip, t)
        }
        if (p.dst_ip) {
          const t = talkers.get(p.dst_ip) || { ip: p.dst_ip, packets: 0, bytes: 0 }
          t.packets += 1
          t.bytes += p.length
          talkers.set(p.dst_ip, t)
        }
      }
      result.summary.top_talkers = Array.from(talkers.values())
        .sort((a, b) => b.bytes - a.bytes || b.packets - a.packets)
        .slice(0, 5)

      // Streams 
      const streamMap = new Map<
        string,
        { protocol: string; a_ip: string; a_port: number; b_ip: string; b_port: number; packets: number; bytes: number }
      >()
      for (const p of packets) {
        const isTCP = (p.protocol || "").toUpperCase().includes("TCP")
        if (!isTCP) continue
        if (!p.src_ip || !p.dst_ip || p.src_port == null || p.dst_port == null) continue

        const a = `${p.src_ip}:${p.src_port}`
        const b = `${p.dst_ip}:${p.dst_port}`
        const [left, right] = [a, b].sort()
        const key = `${left}|${right}`

        const [a_ip, a_portStr] = left.split(":")
        const [b_ip, b_portStr] = right.split(":")
        const a_port = Number.parseInt(a_portStr || "0", 10) || 0
        const b_port = Number.parseInt(b_portStr || "0", 10) || 0

        const agg = streamMap.get(key) || {
          protocol: "TCP",
          a_ip,
          a_port,
          b_ip,
          b_port,
          packets: 0,
          bytes: 0,
        }
        agg.packets += 1
        agg.bytes += p.length
        streamMap.set(key, agg)
      }
      result.streams = Array.from(streamMap.values()).map((s, idx) => ({
        id: idx,
        protocol: s.protocol,
        src_ip: s.a_ip,
        src_port: s.a_port,
        dst_ip: s.b_ip,
        dst_port: s.b_port,
        packets: s.packets,
        bytes: s.bytes,
        content: "",
      }))
    } else {
      result.error = (result.error ? result.error + "; " : "") + "No packet data returned by tshark."
    }
    if (options.extractCredentials) {
      try {
        const httpAuthOutput = await runTsharkCommand(containerPath, "http_auth")
        const lines = httpAuthOutput.split("\n")
        if (lines.length > 1) {
          for (const line of lines.slice(1)) {
            if (!line.trim()) continue
            const parts = line.split(",")
            if (parts.length >= 7) {
              const [uri, auth_b64, src_ip, dst_ip, src_port_str, dst_port_str, frame_num_str] = parts
              if (auth_b64.startsWith("Basic ")) {
                try {
                  const decodedAuth = Buffer.from(auth_b64.substring(6), "base64").toString("utf8")
                  const [username, password] = decodedAuth.split(":")
                  result.credentials.push({
                    type: "HTTP Basic Auth",
                    protocol: "HTTP",
                    source: `${src_ip}:${src_port_str}`,
                    destination: `${dst_ip}:${dst_port_str}`,
                    username,
                    password,
                    details: uri,
                    source_packet_number: Number.parseInt(frame_num_str) || undefined,
                  })
                } catch (e) {
                  console.warn("Failed to decode HTTP Basic Auth:", e)
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("http_auth parse failed:", e)
      }

      try {
        const ftpCredsOutput = await runTsharkCommand(containerPath, "ftp_creds")
        const lines = ftpCredsOutput.split("\n")
        const sessions: Record<
          string,
          { user?: string; pass?: string; src: string; dst: string; src_p: string; dst_p: string; frame: string }
        > = {}
        if (lines.length > 1) {
          for (const line of lines.slice(1)) {
            if (!line.trim()) continue
            const parts = line.split(",")
            if (parts.length >= 7) {
              const [command, arg, src_ip, dst_ip, src_port_str, dst_port_str, frame_num_str] = parts
              const key = `${src_ip}:${src_port_str}-${dst_ip}:${dst_port_str}`
              if (!sessions[key]) {
                sessions[key] = {
                  src: src_ip,
                  dst: dst_ip,
                  src_p: src_port_str,
                  dst_p: dst_port_str,
                  frame: frame_num_str,
                }
              }
              if (command === "USER") {
                sessions[key].user = arg
              } else if (command === "PASS") {
                sessions[key].pass = arg
                if (sessions[key].user && sessions[key].pass) {
                  result.credentials.push({
                    type: "FTP Login",
                    protocol: "FTP",
                    source: `${sessions[key].src}:${sessions[key].src_p}`,
                    destination: `${sessions[key].dst}:${sessions[key].dst_p}`,
                    username: sessions[key].user,
                    password: sessions[key].pass,
                    details: "",
                    source_packet_number: Number.parseInt(sessions[key].frame) || undefined,
                  })
                  delete sessions[key]
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("ftp_creds parse failed:", e)
      }
    }

    if (options.extractFlags) {
      try {
        const flagOutput = await runTsharkCommand(containerPath, "packet_data_for_flags")
        const lines = flagOutput.split("\n")
        const flagPatterns = [/flag\{[^}]+\}/gi, /CTF\{[^}]+\}/gi, /picoCTF\{[^}]+\}/gi]
        if (lines.length > 1) {
          for (const line of lines.slice(1)) {
            if (!line.trim()) continue
            const parts = line.split(",")
            if (parts.length >= 2) {
              const [frame_str, data_text] = parts
              const frame_num = Number.parseInt(frame_str)
              for (const pattern of flagPatterns) {
                let match
                while ((match = pattern.exec(data_text)) !== null) {
                  result.flags.push({
                    value: match[0],
                    source_packet_number: Number.isFinite(frame_num) ? frame_num : undefined,
                    context:
                      data_text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50) + "...",
                  })
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn("flags parse failed:", e)
      }
    }

    return result
  } catch (error) {
    throw new Error(`PCAP analysis failed: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    await Promise.all([
      fs.unlink(hostTempPath).catch(() => {}),
      asyncExecFile("docker", ["exec", process.env.NEXT_PUBLIC_CONTAINER_NAME!, "rm", "-f", containerPath]).catch(
        () => {},
      ),
    ])
  }
}
