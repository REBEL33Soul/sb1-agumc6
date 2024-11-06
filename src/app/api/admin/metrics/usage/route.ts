import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const usage = await db.project.groupBy({
      by: ['appType'],
      _count: {
        id: true,
      },
      _sum: {
        storageUsed: true,
        processingTime: true,
      },
    });

    const data = usage.map((item) => ({
      app: item.appType,
      projects: item._count.id,
      storage: Math.round(item._sum.storageUsed! / (1024 * 1024 * 1024)), // Convert to GB
      processing: Math.round(item._sum.processingTime! / 3600), // Convert to hours
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('[USAGE_ERROR]', error);
    return new NextResponse('Failed to fetch usage metrics', { status: 500 });
  }
}