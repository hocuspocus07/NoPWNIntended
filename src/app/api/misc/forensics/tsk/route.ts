import { NextResponse } from "next/server";
import { runTsk } from "@/lib/runners/runTsk";
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
        "TSK API: Authentication required or user not found",
        userError?.message
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const command = formData.get("command") as string;
    const inode = formData.get("inode") as string | null;

    if (!file) throw new Error("No file uploaded");
    if (!command) throw new Error("No command specified");

    const buffer = Buffer.from(await file.arrayBuffer());
    const output = await runTsk(buffer, { command, inode: inode || undefined });

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
