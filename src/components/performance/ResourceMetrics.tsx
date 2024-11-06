import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ResourceMetric {
  name: string;
  duration: number;
  size: number;
  type: string;
}

interface ResourceMetricsProps {
  resources: ResourceMetric[];
}

export function ResourceMetrics({ resources }: ResourceMetricsProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Process resources for visualization
    const processedData = resources
      .filter(r => r.duration > 0)
      .map(r => ({
        name: r.name.split('/').pop(),
        duration: Math.round(r.duration),
        size: Math.round(r.size / 1024), // Convert to KB
        type: r.type
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10); // Show top 10 slowest resources

    setChartData(processedData);
  }, [resources]);

  const formatDuration = (value: number) => `${value}ms`;
  const formatSize = (value: number) => `${value}KB`;

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Resource Loading</h3>
          <p className="text-sm text-gray-400">Top 10 slowest resources</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name"
                stroke="#6b7280"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="duration"
                orientation="left"
                stroke="#3b82f6"
                tickFormatter={formatDuration}
              />
              <YAxis 
                yAxisId="size"
                orientation="right"
                stroke="#10b981"
                tickFormatter={formatSize}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number, name: string) => [
                  name === 'duration' ? formatDuration(value) : formatSize(value),
                  name === 'duration' ? 'Load Time' : 'Size'
                ]}
              />
              <Bar
                dataKey="duration"
                fill="#3b82f6"
                yAxisId="duration"
                name="Load Time"
              />
              <Bar
                dataKey="size"
                fill="#10b981"
                yAxisId="size"
                name="Size"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Total Resources</p>
            <p className="text-white font-semibold">{resources.length}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Size</p>
            <p className="text-white font-semibold">
              {Math.round(
                resources.reduce((sum, r) => sum + r.size, 0) / 1024 / 1024
              )} MB
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}