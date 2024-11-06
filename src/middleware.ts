import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsMiddleware } from './middleware/cors';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { securityMiddleware } from './middleware/security';
import { webAssemblyMiddleware } from './middleware/webAssembly';

export async function middleware(request: NextRequest) {
  // Apply middleware in order
  let response = await corsMiddleware(request);
  if (response.status !== 200) return response;

  response = await rateLimitMiddleware(request);
  if (response.status !== 200) return response;

  response = await securityMiddleware(request);
  if (response.status !== 200) return response;

  response = await webAssemblyMiddleware(request);
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};