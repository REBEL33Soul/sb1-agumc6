import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityManager } from '@/lib/auth/security';

const security = SecurityManager.getInstance();

export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  const headers = security.getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CSRF protection for mutations
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const sessionId = request.cookies.get('session')?.value;
    const csrfToken = request.headers.get('x-csrf-token');

    if (!sessionId || !csrfToken || !security.validateCSRFToken(sessionId, csrfToken)) {
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }

  // Content validation
  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
    const contentLength = parseInt(request.headers.get('content-length') || '0');
    if (contentLength > 100 * 1024 * 1024) { // 100MB limit
      return new NextResponse('File too large', { status: 413 });
    }
  }

  return response;
}