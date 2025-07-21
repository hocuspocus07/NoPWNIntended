import { NextResponse } from 'next/server'
import { runNmap } from '@/lib/runners/runNmap'
 
export async function GET() {
  return NextResponse.json({ message: "HELLO" })
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // robust destructuring with defaults
        const {
          target,
          ports,
          scripts = '',
          options = '-sV'
        } = body;

        if (!target || !ports) {
          return NextResponse.json({
            error: 'Missing required fields: target or ports',
            status: 400
          });
        }

        const scanResults = await runNmap(target, ports, scripts, options);

        return NextResponse.json({
            data: scanResults,
            status: 'success',
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'unknown error',
            status: 500
        });
    }
}
