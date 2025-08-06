import { NextResponse } from "next/server";
import { runXxd } from "@/lib/runners/runXxd";
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
        "XXD API: Authentication required or user not found",
        userError?.message
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const length = formData.get("length") as string;

    if (!file) throw new Error("No file uploaded");
    if (!length) throw new Error("No length specified");

    const buffer = Buffer.from(await file.arrayBuffer());
    const lengthNum = parseInt(length, 10);

    const output = await runXxd(lengthNum, buffer);

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}
