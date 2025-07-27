import { NextResponse } from "next/server";
import { runBinwalk } from "@/lib/runners/runBinwalk";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";
    if (!token) throw new Error("Auth session missing!");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) throw new Error(userError?.message || "No user found");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const entropyScan = formData.get("entropyScan") === "true";
    const extractFiles = formData.get("extractFiles") !== "false"; // Default true

    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const output = await runBinwalk(buffer, { entropyScan, extractFiles });

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}