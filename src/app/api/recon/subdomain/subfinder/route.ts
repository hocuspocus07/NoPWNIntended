import { NextResponse } from "next/server";
import { runSubfinder } from "@/lib/runners/runSubfinder";

export async function POST(request:Request) {
    try {
        const body=await request.json();
        const scanResults=await runSubfinder(body.domain);
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