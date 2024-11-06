import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Memory, Globe } from 'lucide-react';

export function PerformanceInsights() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/performance/metrics');
      const data = await response.json();
      setMetrics(data.metrics);
      setInsights(data.insights);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">CPU Usage</h3>
            <Cpu className="h-5 w-5 text-blue-400" />
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <XAxis dataKey="timestamp" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Memory Usage</h3>
            <Memory className="h-5 w-5 text-green-400" />
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <XAxis dataKey="timestamp" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Network Activity</h3>
            <Globe className="h-5 w-5 text-purple-400" />
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <XAxis dataKey="timestamp" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="bandwidth"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
            <Activity className="h-5 w-5 text-yellow-400" />
          </div>
          
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-3 bg-gray-900/50 rounded-lg text-sm text-gray-300"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}