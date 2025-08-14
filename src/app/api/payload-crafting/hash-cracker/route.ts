import { runHashcat } from "@/lib/runners/runHashcat";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export async function POST(request:Request) {
    try {
      const supabase = await createClient() 
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser()
      
          if (userError || !user) {
            console.error("HASHCRACKER API: Authentication required or user not found", userError?.message)
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
          }
      
        const body=await request.json();
        const scanResults=await runHashcat(body.hash,body.hashType,body.wordlist,body.attackMode,body.rulesFile);
        const unique = Array.from(new Set(scanResults.trim().split('\n'))).join('\n');
    if (!unique) {
      return NextResponse.json({
        data: null,
        message: "Hash could not be cracked with the given wordlist.",
        status: "success"
      });
    }

    return NextResponse.json({
      data: unique,
      status: "success"
    });
    } catch (error) {
        return NextResponse.json({
            error:error instanceof Error ? error.message:'unknown error',
            status:500
        })
    }
}