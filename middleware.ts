import { NextRequest,NextResponse } from "next/server";
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  // Handle OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: response.headers });
  }
  return response;
}