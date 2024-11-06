import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();

    await db.metric.create({
      data: {
        name: data.name,
        value: data.value,
        timestamp: new Date(data.timestamp),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[METRICS_ERROR]', error);
    return new NextResponse('Failed to store metrics', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const duration = parseInt(searchParams.get('duration') || '3600000');
    const metric = searchParams.get('metric');

    const cutoff = new Date(Date.now() - duration);

    const metrics = await db.metric.findMany({
      where: {
        name: metric || undefined,
        timestamp: {
          gte: cutoff,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[METRICS_GET_ERROR]', error);
    return new NextResponse('Failed to retrieve metrics', { status: 500 });
  }
}