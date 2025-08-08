import { NextResponse } from "next/server"
import { testVPNConnection } from "@/lib/runners/runOpenvpn"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Input sanitization
    const sanitizedUrl = sanitizeUrl(url.trim())
    if (!sanitizedUrl) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const result = await testVPNConnection(user.id, sanitizedUrl)

    return NextResponse.json({
      data: result,
      status: "success",
    })
  } catch (err: any) {
    console.error("Test API Error:", err)
    return NextResponse.json(
      {
        error: err?.message || "An unknown error occurred.",
      },
      {
        status: 500,
      }
    )
  }
}

function sanitizeUrl(url: string): string | null {
  try {
    const cleaned = url.replace(/[`$(){}[\]|&;<>]/g, '')
    
    const urlObj = new URL(cleaned)
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null
    }
    
    const hostname = urlObj.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ){
        //future ft: allowing only specific private IPs
    }
    
    return urlObj.toString()
  } catch (error) {
    return null
  }
}
