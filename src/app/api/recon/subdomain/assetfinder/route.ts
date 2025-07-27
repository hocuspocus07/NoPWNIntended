import { NextResponse } from "next/server";
import { runAssetFinder } from "@/lib/runners/runAssetfinder";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";
        if (!token) throw new Error("Auth session missing!");

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

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