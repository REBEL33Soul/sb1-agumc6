import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const PLANS = {
  BASIC: {
    name: 'Basic',
    price: 10,
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    features: [
      'Basic audio restoration',
      'Up to 10 projects',
      'Standard quality exports',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 20,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Advanced audio restoration',
      'Unlimited projects',
      'High quality exports',
      'Priority processing',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 100,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      'Custom audio models',
      'Dedicated support',
      'API access',
      'Custom integrations',
    ],
  },
};