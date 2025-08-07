import { NextResponse } from "next/server";
import { runSSLscan } from "@/lib/runners/runSSLscan";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "SSL-SCAN API: Authentication required or user not found",
        userError?.message
      );
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const { target, startTls, scanOpts } = await request.json();

    if (!target) throw new Error("Target is required");

    const output = await runSSLscan(target, startTls, scanOpts);

    return NextResponse.json({
      data: output,
      status: "success",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || String(err),
      },
      {
        status: 500,
      }
    );
  }
}
