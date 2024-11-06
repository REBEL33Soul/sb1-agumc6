import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { SystemVerification } from '@/lib/core/SystemVerification';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const verification = SystemVerification.getInstance();
    const status = await verification.verifyAllSystems();

    return NextResponse.json(status);
  } catch (error) {
    console.error('[SYSTEM_VERIFY_ERROR]', error);
    return new NextResponse('Verification failed', { status: 500 });
  }
}