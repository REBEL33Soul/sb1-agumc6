import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const alert = await req.json();

    await db.alert.create({
      data: {
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: new Date(alert.timestamp),
      },
    });

    // Send notifications based on severity
    if (alert.severity === 'critical' || alert.severity === 'high') {
      await sendUrgentNotification(alert);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ALERT_ERROR]', error);
    return new NextResponse('Failed to process alert', { status: 500 });
  }
}

async function sendUrgentNotification(alert: any) {
  // Implement notification logic (email, SMS, etc.)
  console.error('URGENT ALERT:', alert);
}