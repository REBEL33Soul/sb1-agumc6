import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { ProcessingQueue } from '@/lib/queue/processor';

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const queue = ProcessingQueue.getInstance();
    const progress = await queue.getProgress(params.projectId);

    return NextResponse.json(progress);
  } catch (error) {
    console.error('[PROGRESS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}