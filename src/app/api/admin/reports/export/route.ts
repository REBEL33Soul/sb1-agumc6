import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { MetricsCalculator } from '@/lib/reporting/metrics-calculator';
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get metrics data
    const calculator = MetricsCalculator.getInstance();
    const metrics = await fetchMetricsData(); // Implement this function

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Financial summary sheet
    const summaryData = createSummarySheet(metrics);
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Financial Summary');

    // Usage metrics sheet
    const usageData = createUsageSheet(metrics);
    const usageWs = XLSX.utils.json_to_sheet(usageData);
    XLSX.utils.book_append_sheet(wb, usageWs, 'Usage Metrics');

    // User analytics sheet
    const userData = createUserSheet(metrics);
    const userWs = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(wb, userWs, 'User Analytics');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="financial-report-${new Date().toISOString()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT_ERROR]', error);
    return new NextResponse('Export failed', { status: 500 });
  }
}

function createSummarySheet(metrics: any) {
  return [
    {
      period: 'Current Month',
      revenue: metrics.revenue,
      costs: metrics.costs.total,
      profit: metrics.profit,
      margin: `${metrics.margins.netMargin}%`,
    },
    // Add more rows...
  ];
}

function createUsageSheet(metrics: any) {
  return [
    {
      app: 'Restoration',
      projects: metrics.usage.restoration.projects,
      storage: `${metrics.usage.restoration.storage}GB`,
      processing: `${metrics.usage.restoration.processing}hrs`,
    },
    // Add more rows...
  ];
}

function createUserSheet(metrics: any) {
  return [
    {
      type: 'Free Trial',
      count: metrics.users.trial,
      conversion: `${metrics.users.trialConversion}%`,
      revenue: metrics.users.trialRevenue,
    },
    // Add more rows...
  ];
}