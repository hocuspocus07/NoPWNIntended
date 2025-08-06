import { NextResponse } from "next/server";
import { runForemost } from "@/lib/runners/runForemost";
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
        "FOREMOST API: Authentication required or user not found",
        userError?.message
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const configFile = formData.get("configFile") as string | null;

    if (!file) throw new Error("No file uploaded");

    const buffer = Buffer.from(await file.arrayBuffer());
    const output = await runForemost(buffer, {
      configFile: configFile || undefined,
    });

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
