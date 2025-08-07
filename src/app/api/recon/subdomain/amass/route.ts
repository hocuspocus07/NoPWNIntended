import { NextResponse } from "next/server";
import { runAmass } from "@/lib/runners/runAmass";
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
                "AMASS API: Authentication required or user not found",
                userError?.message
              );
              return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
              );
            }
        const body=await request.json();
        const scanResults=await runAmass(body.domain,body.bruteforce
            ,body.passive,body.active
        );
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