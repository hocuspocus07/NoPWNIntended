import { NextResponse } from "next/server";
import { runWhois } from "@/lib/runners/runWhois";

export async function POST(request:Request) {
    try {
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