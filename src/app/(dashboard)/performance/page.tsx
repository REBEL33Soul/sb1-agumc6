import { BrowserMetrics } from '@/components/performance/BrowserMetrics';
import { ResourceMetrics } from '@/components/performance/ResourceMetrics';
import { BrowserOptimizer } from '@/lib/performance/BrowserOptimizer';

export default async function PerformancePage() {
  const optimizer = BrowserOptimizer.getInstance();
  const recommendations = await optimizer.getOptimizationRecommendations();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Performance Monitoring</h2>
        <p className="text-gray-400 mt-2">
          Monitor and optimize browser-specific performance metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BrowserMetrics
          browser="chrome"
          metrics={{
            fcp: 800,
            lcp: 2000,
            fid: 50,
            cls: 0.05,
            ttfb: 100
          }}
        />
        <BrowserMetrics
          browser="safari"
          metrics={{
            fcp: 1000,
            lcp: 2200,
            fid: 70,
            cls: 0.08,
            ttfb: 120
          }}
        />
      </div>

      <ResourceMetrics
        resources={[
          {
            name: '/static/js/main.js',
            duration: 500,
            size: 250000,
            type: 'script'
          },
          {
            name: '/static/css/main.css',
            duration: 200,
            size: 50000,
            type: 'style'
          }
          // Add more resources as needed
        ]}
      />

      {recommendations.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Optimization Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-gray-400">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}