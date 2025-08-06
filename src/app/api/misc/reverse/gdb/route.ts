import { NextResponse } from "next/server";
import { runGdb } from "@/lib/runners/runGdb";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "GDB API: Authentication required or user not found",
        userError?.message
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
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
