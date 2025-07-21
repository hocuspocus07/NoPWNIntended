import { NextResponse } from "next/server";
import { runSSLscan } from "@/lib/runners/runSSLscan";

export async function POST(request:Request) {
    try {
        const body=await request.json();
        const scanResults=await runSSLscan(body.target,body.startTls,body.scanOpts);
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