import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { TestRunner } from '@/lib/testing/TestRunner';

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const testRunner = TestRunner.getInstance();
    const results = await testRunner.runAllTests();

    return NextResponse.json(results);
  } catch (error) {
    console.error('[TEST_ERROR]', error);
    return new NextResponse('Test execution failed', { status: 500 });
  }
}