import { NextResponse } from "next/server";
import { runObjdump } from "@/lib/runners/runObjdump";
import { createClient } from "@supabase/supabase-js";

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
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const args = formData.get("args") as string;

    if (!file) throw new Error("No file uploaded");

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) throw new Error(userError?.message || "No user found");

    // convert to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());

    const output = await runObjdump(args, buffer);

    return NextResponse.json({ output });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
