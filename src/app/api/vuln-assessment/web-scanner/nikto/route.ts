import { NextResponse } from "next/server";
import { runNikto } from "@/lib/runners/runNikto";

export async function POST(request:Request) {
    try {
        const body=await request.json();
        const scanResults=await runNikto(body.target,body.aggressiveness);
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