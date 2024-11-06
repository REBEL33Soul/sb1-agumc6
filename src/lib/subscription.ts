import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { SUITE_APPS } from '@/lib/shared/constants';
import type { AppFeatures } from '@/lib/shared/types';

const DAY_IN_MS = 86_400_000;
const TRIAL_DAYS = 5;

export async function checkSubscription(): Promise<{
  isSubscribed: boolean;
  features: AppFeatures;
  trialEndsAt?: Date;
  isTrialing?: boolean;
}> {
  const { userId } = auth();

  if (!userId) {
    return { isSubscribed: false, features: {} };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    return { isSubscribed: false, features: {} };
  }

  // Check trial status
  if (user.trialEndsAt && user.trialEndsAt > new Date()) {
    return {
      isSubscribed: true,
      features: SUITE_APPS.SUITE.features,
      trialEndsAt: user.trialEndsAt,
      isTrialing: true,
    };
  }

  if (!user.subscription) {
    return { isSubscribed: false, features: {} };
  }

  const isValid =
    user.subscription.status === 'active' &&
    user.subscription.currentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return {
    isSubscribed: isValid,
    features: isValid ? (user.subscription.apps as AppFeatures) : {},
  };
}

export function getAppFeatures(priceId: string): AppFeatures {
  // Map price IDs to feature sets
  switch (priceId) {
    case process.env.STRIPE_RESTORATION_PRICE_ID:
      return {
        restoration: {
          enabled: true,
          maxProjects: 100,
          batchProcessing: true,
        },
      };
    case process.env.STRIPE_MASTERING_PRICE_ID:
      return {
        mastering: {
          enabled: true,
          maxTracks: 100,
          referenceMatching: true,
        },
      };
    case process.env.STRIPE_GENERATION_PRICE_ID:
      return {
        generation: {
          enabled: true,
          maxGenerations: 100,
          customModels: true,
        },
      };
    case process.env.STRIPE_SUITE_PRICE_ID:
      return {
        restoration: {
          enabled: true,
          maxProjects: 500,
          batchProcessing: true,
        },
        mastering: {
          enabled: true,
          maxTracks: 500,
          referenceMatching: true,
        },
        generation: {
          enabled: true,
          maxGenerations: 500,
          customModels: true,
        },
      };
    default:
      return {};
  }
}

export async function startTrial(userId: string): Promise<void> {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  await db.user.update({
    where: { id: userId },
    data: { trialEndsAt },
  });
}

export async function cancelSubscription(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription?.stripeSubscriptionId) {
    throw new Error('No active subscription');
  }

  await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await db.subscription.update({
    where: { userId },
    data: { status: 'canceled' },
  });
}