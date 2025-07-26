import { NextResponse } from "next/server";
import { runExifTool } from "@/lib/runners/runExiftool";
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
    const outputFormat = formData.get("outputFormat") as string || "human";
    const groupNames = formData.get("groupNames") === "true";
    const binaryOutput = formData.get("binaryOutput") === "true";
    const showAllTags = formData.get("showAllTags") === "true";
    const showCommonTags = formData.get("showCommonTags") !== "false"; 
    const specificTags = formData.get("specificTags") as string || "";
    const geotagsOnly = formData.get("geotagsOnly") === "true";
    const removeMetadata = formData.get("removeMetadata") === "true";

    if (!file) throw new Error("No file uploaded");

    const validFormats = ["human", "json", "csv", "xml"];
    if (!validFormats.includes(outputFormat)) {
      throw new Error(`Invalid output format. Must be one of: ${validFormats.join(", ")}`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const output = await runExifTool(buffer, {
      outputFormat: outputFormat as any,
      groupNames,
      binaryOutput,
      showAllTags,
      showCommonTags,
      specificTags,
      geotagsOnly,
      removeMetadata
    });

    return NextResponse.json({ output });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}