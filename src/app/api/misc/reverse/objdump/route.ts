import { NextResponse } from "next/server";
import { runObjdump } from "@/lib/runners/runObjdump";
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
        "OBJDUMP API: Authentication required or user not found",
        userError?.message
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const args = formData.get("args") as string;

    if (!file) throw new Error("No file uploaded");

    // convert to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());

    const output = await runObjdump(args, buffer);

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
