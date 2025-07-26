import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runRadare2 } from "@/lib/runners/runRadare2";
import { getVirusScanResult, validateFileType } from "@/utils/security";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";
    if (!token) throw new Error("Auth session missing!");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) throw new Error(userError?.message || "No user found");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = formData.get("mode") as string | null;

    if (!file) throw new Error("No file uploaded");
    if (!mode) throw new Error("No mode specified");

    const arrayBuffer = await file.arrayBuffer();
    const buffer: Buffer = Buffer.from(arrayBuffer);

    // Security checks
    if (!validateFileType(buffer)) throw new Error("Invalid file type");
    // if (!(await getVirusScanResult(buffer))) throw new Error("Malware detected");

    const output = await runRadare2(mode, buffer);

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
