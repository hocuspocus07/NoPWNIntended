import { NextResponse } from 'next/server'
import { runNmap } from '@/lib/runners/runNmap'
 
export async function GET() {
  return NextResponse.json({ message: "HELLO" })
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.target) {
      return NextResponse.json({
        error: 'Target is required',
        status: 400
      }, { status: 400 });
    }

    const {
      target,
      ports = '',
      scripts = '',
      options = '-T4' // Default to timing template 4
    } = body;

    if (typeof target !== 'string' || target.length > 255) {
      return NextResponse.json({
        error: 'Invalid target format',
        status: 400
      }, { status: 400 });
    }

    const scanResults = await runNmap(
      target, 
      ports, 
      scripts, 
      options
    );

    if (!scanResults.success) {
      return NextResponse.json({
        error: scanResults.error,
        logs: scanResults.logs,
        status: 'error'
      }, { status: 500 });
    }

    return NextResponse.json({
      data: scanResults.output,
      logs: scanResults.logs,
      status: 'success',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Nmap scan error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500
    }, { status: 500 });
  }
}