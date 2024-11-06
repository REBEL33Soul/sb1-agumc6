import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiter } from '@/lib/security/RateLimiter';

const rateLimiter = RateLimiter.getInstance();

export async function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const path = request.nextUrl.pathname;

  // Different limits for different endpoints
  const limits = {
    '/api/audio/process': { windowMs: 60000, max: 10 }, // 10 requests per minute
    '/api/projects': { windowMs: 300000, max: 50 }, // 50 requests per 5 minutes
    default: { windowMs: 60000, max: 100 } // 100 requests per minute
  };

  const limit = limits[path] || limits.default;
  const isAllowed = await rateLimiter.checkLimit(ip, limit);

  if (!isAllowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': limit.max.toString(),
        'X-RateLimit-Reset': (Date.now() + limit.windowMs).toString(),
      },
    });
  }

  return NextResponse.next();
}