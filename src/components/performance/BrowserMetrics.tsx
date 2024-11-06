import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';

interface MetricsProps {
  browser: string;
  metrics: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
}

export function BrowserMetrics({ browser, metrics }: MetricsProps) {
  const [status, setStatus] = useState<'good' | 'needs-improvement' | 'poor'>('good');

  useEffect(() => {
    // Evaluate overall performance
    const scores = {
      fcp: metrics.fcp < 1000 ? 2 : metrics.fcp < 2000 ? 1 : 0,
      lcp: metrics.lcp < 2500 ? 2 : metrics.lcp < 4000 ? 1 : 0,
      fid: metrics.fid < 100 ? 2 : metrics.fid < 300 ? 1 : 0,
      cls: metrics.cls < 0.1 ? 2 : metrics.cls < 0.25 ? 1 : 0
    };

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxScore = Object.keys(scores).length * 2;

    setStatus(
      totalScore >= maxScore * 0.8 ? 'good' :
      totalScore >= maxScore * 0.5 ? 'needs-improvement' : 'poor'
    );
  }, [metrics]);

  const formatDuration = (ms: number) => {
    return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    return value <= thresholds[0] ? 'text-green-400' :
           value <= thresholds[1] ? 'text-yellow-400' : 'text-red-400';
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white capitalize">
              {browser} Performance
            </h3>
            <p className="text-sm text-gray-400">Core Web Vitals</p>
          </div>
          {status === 'good' && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
          {status === 'needs-improvement' && (
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          )}
          {status === 'poor' && (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">First Contentful Paint</span>
              <span className={`text-sm ${getStatusColor(metrics.fcp, [1000, 2000])}`}>
                {formatDuration(metrics.fcp)}
              </span>
            </div>
            <Progress value={(1000 / metrics.fcp) * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Largest Contentful Paint</span>
              <span className={`text-sm ${getStatusColor(metrics.lcp, [2500, 4000])}`}>
                {formatDuration(metrics.lcp)}
              </span>
            </div>
            <Progress value={(2500 / metrics.lcp) * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">First Input Delay</span>
              <span className={`text-sm ${getStatusColor(metrics.fid, [100, 300])}`}>
                {formatDuration(metrics.fid)}
              </span>
            </div>
            <Progress value={(100 / metrics.fid) * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Cumulative Layout Shift</span>
              <span className={`text-sm ${getStatusColor(metrics.cls, [0.1, 0.25])}`}>
                {metrics.cls.toFixed(3)}
              </span>
            </div>
            <Progress value={(0.1 / metrics.cls) * 100} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Time to First Byte</span>
            </div>
            <span className={`text-sm ${getStatusColor(metrics.ttfb, [100, 300])}`}>
              {formatDuration(metrics.ttfb)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}