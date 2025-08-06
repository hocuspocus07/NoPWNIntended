import { NextResponse } from "next/server";
import { runBinwalk } from "@/lib/runners/runBinwalk";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if(userError||!user){
      console.error("BINWALK API: Authentication required or user not found", userError?.message)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
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