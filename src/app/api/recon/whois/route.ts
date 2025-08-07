import { NextResponse } from "next/server";
import { runWhois } from "@/lib/runners/runWhois";
import { createClient } from "@/utils/supabase/server";
export async function POST(request:Request) {
    try {
        const supabase = await createClient();
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();
        
            if (userError || !user) {
              console.error(
                "WHOIS API: Authentication required or user not found",
                userError?.message
              );
              return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
              );
            }
        const body=await request.json();
        const scanResults=await runWhois(body.domain,body.scanOpts);
        return NextResponse.json({
            data:scanResults,
            status:'success',
        })
    } catch (error) {
        return NextResponse.json({
            error:error instanceof Error ? error.message:'unknown error',
            status:500
        })
    }
}