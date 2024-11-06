import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { MetricsCalculator } from '@/lib/reporting/metrics-calculator';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const calculator = MetricsCalculator.getInstance();
    const metrics = await db.metric.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const costs = metrics.reduce(
      (acc, metric) => {
        const costs = calculator.calculateProjectCosts(metric as any).costs;
        return {
          processing: acc.processing + costs.processing,
          storage: acc.storage + costs.storage,
          bandwidth: acc.bandwidth + costs.bandwidth,
          overhead: acc.overhead + costs.overhead,
        };
      },
      { processing: 0, storage: 0, bandwidth: 0, overhead: 0 }
    );

    return NextResponse.json(costs);
  } catch (error) {
    console.error('[COSTS_ERROR]', error);
    return new NextResponse('Failed to fetch costs', { status: 500 });
  }
}