import { Card } from '@/components/ui/card';

const FAQ_ITEMS = [
  {
    question: "What's included in the free trial?",
    answer: "The 5-day trial includes full access to all features across our suite of apps. You can process up to 5 songs with no limitations on duration or quality settings."
  },
  {
    question: "Can I switch plans anytime?",
    answer: "Yes, you can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the start of your next billing cycle."
  },
  {
    question: "How does the à la carte pricing work?",
    answer: "With à la carte pricing, you can add individual apps to your subscription for $5/month each. This is perfect if you only need specific features from our suite."
  },
  {
    question: "Are there any hidden costs?",
    answer: "No hidden costs. Our pricing includes all processing, storage, and export features. You only pay for your chosen subscription tier."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and wire transfers for enterprise customers."
  },
  {
    question: "What happens to my projects if I cancel?",
    answer: "You'll have 30 days to download your projects after cancellation. After that, they will be securely deleted from our servers."
  }
];

export function PricingFAQ() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-400">
          Everything you need to know about our pricing and plans
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FAQ_ITEMS.map((item, index) => (
          <Card key={index} className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
              {item.question}
            </h3>
            <p className="text-gray-400">{item.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}