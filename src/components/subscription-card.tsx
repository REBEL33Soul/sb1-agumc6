import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Check, Loader2 } from 'lucide-react';
import { SUITE_APPS } from '@/lib/shared/constants';
import { useToast } from './ui/use-toast';

interface SubscriptionCardProps {
  appId: keyof typeof SUITE_APPS;
  isSubscribed?: boolean;
  onSubscribe: (priceId: string) => Promise<void>;
}

export function SubscriptionCard({
  appId,
  isSubscribed,
  onSubscribe
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const app = SUITE_APPS[appId];

  const handleSubscribe = async (interval: 'monthly' | 'yearly') => {
    try {
      setLoading(true);
      const priceId = interval === 'monthly' 
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;
      await onSubscribe(priceId!);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process subscription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white">{app.name}</h3>
          <p className="text-gray-400 mt-2">{app.description}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">
              ${app.monthlyPrice}
              <span className="text-gray-400 text-sm font-normal">/month</span>
            </span>
            <span className="text-gray-400">
              or ${app.yearlyPrice}/year
            </span>
          </div>

          <ul className="space-y-3">
            {app.features.map((feature) => (
              <li key={feature} className="flex items-center text-gray-300">
                <Check className="h-5 w-5 text-green-400 mr-2" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <Button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading || isSubscribed}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSubscribed ? (
                'Current Plan'
              ) : (
                'Subscribe Monthly'
              )}
            </Button>
            <Button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading || isSubscribed}
              variant="outline"
              className="w-full"
            >
              Subscribe Yearly (Save 17%)
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}