import { NextResponse } from "next/server";
import { runAssetFinder } from "@/lib/runners/runAssetfinder";

export async function POST(request:Request) {
    try {
        const body=await request.json();
        const scanResults=await runAssetFinder(body.domain);
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