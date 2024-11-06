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
      orderBy: {
        timestamp: 'asc',
      },
    });

    const margins = metrics.map((metric) => {
      const financialMetrics = calculator.calculateProjectCosts(metric as any);
      const margins = calculator.calculateMargins(financialMetrics);
      return {
        date: metric.timestamp,
        ...margins,
      };
    });

    return NextResponse.json(margins);
  } catch (error) {
    console.error('[MARGINS_ERROR]', error);
    return new NextResponse('Failed to fetch margins', { status: 500 });
  }
}