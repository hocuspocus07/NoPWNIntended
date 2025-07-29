import { NextResponse } from "next/server";
import { runSkipfish } from "@/lib/runners/runSkipFish";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const token = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
    if (!token) throw new Error("Auth session missing!");

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) throw new Error(userError?.message || "No user found");

    const { target, aggressiveness } = await request.json();
    if (!target) throw new Error("Target is required");

    const result = await runSkipfish(target, aggressiveness);
    return NextResponse.json({ data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
