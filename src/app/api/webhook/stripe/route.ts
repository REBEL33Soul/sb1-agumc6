import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      return new NextResponse('User id is required', { status: 400 });
    }

    await db.subscription.create({
      data: {
        userId: session.metadata.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });

    // Send welcome email
    await sendEmail({
      to: session.customer_details?.email!,
      subject: 'Welcome to Replicator Studio!',
      template: 'welcome',
      data: {
        name: session.customer_details?.name,
        apps: session.metadata.apps,
      },
    });
  }

  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await db.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });

    // Send renewal confirmation
    await sendEmail({
      to: session.customer_details?.email!,
      subject: 'Subscription Renewed',
      template: 'renewal',
      data: {
        name: session.customer_details?.name,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;

    await db.subscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: 'canceled',
      },
    });

    // Send cancellation confirmation
    await sendEmail({
      to: session.customer_details?.email!,
      subject: 'Subscription Canceled',
      template: 'cancellation',
      data: {
        name: session.customer_details?.name,
        endDate: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}