import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { startTrial } from '@/lib/subscription';
import { SubscriptionCard } from '@/components/subscription-card';
import { SUITE_APPS } from '@/lib/shared/constants';

export default async function WelcomePage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Start trial
  await startTrial(userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Replicator Studio
          </h1>
          <p className="text-xl text-gray-400">
            Your 5-day trial of all features has started. Choose a plan to continue after your trial.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(SUITE_APPS).map(([id, app]) => (
            <SubscriptionCard
              key={id}
              appId={id as keyof typeof SUITE_APPS}
              onSubscribe={async (priceId) => {
                const response = await fetch('/api/stripe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ priceId }),
                });
                const data = await response.json();
                window.location.href = data.url;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}