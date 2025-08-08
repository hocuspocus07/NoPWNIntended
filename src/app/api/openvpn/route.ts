import { NextResponse } from "next/server"
import { runOpenVPN, disconnectOpenVPN, getConnectionStatus } from "@/lib/runners/runOpenvpn"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const status = await getConnectionStatus(user.id)

    return NextResponse.json({
      data: status,
      status: "success",
    })
  } catch (err: any) {
    console.error("Status API Error:", err)
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("OPENVPN API: Authentication required or user not found", userError?.message)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No .ovpn file uploaded." }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const result = await runOpenVPN({
      fileContent: fileBuffer,
      fileName: file.name,
      userId: user.id,
    })

    return NextResponse.json({
      data: result,
      status: "success",
    })
  } catch (err: any) {
    console.error("API Error:", err)
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

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const result = await disconnectOpenVPN(user.id)

    return NextResponse.json({
      data: result,
      status: "success",
    })
  } catch (err: any) {
    console.error("Disconnect API Error:", err)
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
