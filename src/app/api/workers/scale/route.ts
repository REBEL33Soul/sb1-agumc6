import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { action } = await req.json();

    // Scale workers using Cloudflare API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${process.env.WORKER_SCRIPT_NAME}/settings`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: action === 'up' ? '+1' : '-1',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to scale workers');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SCALE_ERROR]', error);
    return new NextResponse('Failed to scale workers', { status: 500 });
  }
}