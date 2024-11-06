import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { TestRunner } from '@/lib/testing/TestRunner';
import { SystemMonitor } from '@/lib/monitoring/SystemMonitor';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const testRunner = TestRunner.getInstance();
    const systemMonitor = SystemMonitor.getInstance();

    // Run tests
    const testResults = await testRunner.runAllTests();

    // Get performance metrics
    const metrics = await systemMonitor.getMetrics();

    return NextResponse.json({
      testResults,
      metrics,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[TEST_RESULTS_ERROR]', error);
    return new NextResponse('Failed to get test results', { status: 500 });
  }
}