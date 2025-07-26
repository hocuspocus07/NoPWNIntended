import { NextResponse } from "next/server";
import { runGdb } from "@/lib/runners/runGdb";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : "";
    if (!token) throw new Error("Auth session missing!");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    ); 
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (!user) throw new Error(userError?.message || "No user found");

    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    const cmd = formData.get("cmd") as string;

    if (!file) throw new Error("No file uploaded");
    if (!cmd) throw new Error("No command specified"); // blob>array buffer>buffer

    const arrayBuffer = await file.arrayBuffer();
    const output = await runGdb(cmd, arrayBuffer);

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
