import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { projectId, chunkKeys, settings } = await req.json();

    // Add to Cloudflare Queue
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/queues/audio-processing/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: {
            projectId,
            chunkKeys,
            settings,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to enqueue job');
    }

    // Update project status
    await db.project.update({
      where: { id: projectId },
      data: { status: 'queued' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QUEUE_ERROR]', error);
    return new NextResponse('Failed to enqueue job', { status: 500 });
  }
}