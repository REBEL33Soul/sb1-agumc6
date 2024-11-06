'use client';

import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface SubscriptionButtonProps {
  isPro: boolean;
  priceId: string;
}

export function SubscriptionButton({
  isPro,
  priceId,
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stripe');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('STRIPE_CLIENT_ERROR', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={onClick}
      className="mt-8 w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
      ) : isPro ? (
        'Manage Subscription'
      ) : (
        'Upgrade to Pro'
      )}
    </button>
  );
}