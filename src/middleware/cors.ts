import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config } from '@/lib/config/environment';

export function corsMiddleware(request: NextRequest) {
  // Check if origin is allowed
  const origin = request.headers.get('origin');
  const allowedOrigins = config.security.cors.allowedOrigins;
  
  if (!origin || !allowedOrigins.includes(origin)) {
    return new NextResponse('Invalid origin', { status: 403 });
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': config.security.cors.allowedMethods.join(', '),
        'Access-Control-Allow-Headers': [
          'Content-Type',
          'Authorization',
          'X-CSRF-Token',
          'X-Requested-With'
        ].join(', '),
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    });
  }

  // Add CORS headers to response
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Vary', 'Origin');

  return response;
}