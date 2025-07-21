import { runHashcat } from "@/lib/runners/runHashcat";
import { NextResponse } from "next/server";

export async function POST(request:Request) {
    try {
        const body=await request.json();
        const scanResults=await runHashcat(body.hash,body.hashType,body.wordlist,body.attackMode,body.rulesFile,body.workload,body.usepotfile);
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