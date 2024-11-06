import { checkSubscription } from '@/lib/subscription';
import { SubscriptionButton } from '@/components/subscription-button';
import { Card } from '@/components/ui/card';
import { PLANS } from '@/lib/stripe';

export default async function SettingsPage() {
  const isPro = await checkSubscription();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-2">Manage your subscription and account settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <Card key={plan.name} className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <div className="flex flex-col h-full">
              <div>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-3xl font-bold text-white mt-4">
                  ${plan.price}
                  <span className="text-gray-400 text-sm font-normal">/month</span>
                </p>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-300">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <SubscriptionButton isPro={isPro} priceId={plan.priceId} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}