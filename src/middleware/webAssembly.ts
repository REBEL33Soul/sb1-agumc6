import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function webAssemblyMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add WebAssembly-specific headers
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Enable SharedArrayBuffer for parallel processing
  if (request.headers.get('sec-fetch-dest') === 'worker') {
    response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }

  return response;
}