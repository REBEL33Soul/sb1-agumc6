import { PRICING_TIERS } from '@/lib/pricing/tiers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PricingTiers() {
  const router = useRouter();

  const handleSelectPlan = async (tierId: string) => {
    router.push(`/signup?plan=${tierId}`);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
      {Object.entries(PRICING_TIERS).map(([id, tier]) => (
        <Card
          key={id}
          className={`p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700 ${
            id === 'PRO' ? 'ring-2 ring-blue-500 scale-105' : ''
          }`}
        >
          <div className="space-y-6">
            {id === 'PRO' && (
              <div className="flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full py-1 px-3 text-sm font-medium mb-4">
                <Zap className="h-4 w-4 mr-1" />
                Most Popular
              </div>
            )}

            <div>
              <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
              <div className="mt-4 flex items-baseline">
                {typeof tier.price === 'object' ? (
                  <>
                    <span className="text-4xl font-bold text-white">
                      ${tier.price.monthly}
                    </span>
                    <span className="text-gray-400 ml-1">/month</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {tier.price}
                  </span>
                )}
              </div>
            </div>

            <ul className="space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-green-400 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSelectPlan(id)}
              className="w-full"
              variant={id === 'PRO' ? 'default' : 'outline'}
            >
              {id === 'ENTERPRISE' ? 'Contact Sales' : 'Get Started'}
            </Button>

            {typeof tier.price === 'object' && (
              <p className="text-center text-sm text-gray-400">
                or ${tier.price.yearly}/year (save 17%)
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}