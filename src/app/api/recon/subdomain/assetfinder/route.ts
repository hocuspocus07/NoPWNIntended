import { NextResponse } from "next/server";
import { runAssetFinder } from "@/lib/runners/runAssetfinder";
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
                "ASSETFINDER API: Authentication required or user not found",
                userError?.message
              );
              return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
              );
            }
        const { domain } = await request.json();
        if (!domain) throw new Error("Domain is required");

        const subdomains = await runAssetFinder(domain);

        return NextResponse.json({
            data: {
                subdomains,
                count: subdomains.length,
                domain,
                timestamp: new Date().toISOString()
            },
            status: 'success'
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
        }, { status: 500 });
    }
}