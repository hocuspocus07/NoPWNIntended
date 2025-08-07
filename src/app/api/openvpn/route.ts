import { NextResponse } from "next/server";
import { runOpenVPN } from "@/lib/runners/runOpenvpn";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("OPENVPN API: Authentication required or user not found", userError?.message);
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File; 

    if (!file) {
      throw new Error("No .ovpn file uploaded.");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const output = await runOpenVPN(fileBuffer, file.name);

    return NextResponse.json({
      data: output,
      status: "success",
    });
  } catch (err: any) {
    console.error("API Error:", err); 
    return NextResponse.json(
      {
        error: err.message || "An unknown error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}
