import { PricingTiers } from '@/components/pricing/pricing-tiers';
import { PricingCalculator } from '@/components/pricing/pricing-calculator';
import { PricingFAQ } from '@/components/pricing/pricing-faq';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your audio production needs. All plans include our core restoration features.
          </p>
        </div>

        <PricingTiers />
        <PricingCalculator />
        <PricingFAQ />
      </div>
    </div>
  );
}