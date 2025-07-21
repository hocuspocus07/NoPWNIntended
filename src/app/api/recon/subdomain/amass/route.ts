import { NextResponse } from "next/server";
import { runAmass } from "@/lib/runners/runAmass";

export async function POST(request:Request) {
    try {
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