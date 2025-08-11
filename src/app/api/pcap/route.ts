import { NextResponse } from "next/server"
import { runPcapAnalysis } from "@/lib/runners/runPcap"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const extractCredentials = formData.get("extractCredentials") === "true"
    const extractFlags = formData.get("extractFlags") === "true"
    const filterExpression = (formData.get("filterExpression") as string) || ""
    const showRawPackets = formData.get("showRawPackets") === "true"

    if (!file) {
      return NextResponse.json({ error: "No PCAP file uploaded" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const output = await runPcapAnalysis(buffer, {
      extractCredentials,
      extractFlags,
      filterExpression,
      showRawPackets,
    })

    return NextResponse.json(output)
  } catch (err: any) {
    console.error("PCAP Analyzer API: Error processing request:", err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
