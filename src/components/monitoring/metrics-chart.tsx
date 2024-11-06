import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function MetricsChart() {
  const [metric, setMetric] = useState('cpu');
  const [data, setData] = useState([]);
  const [duration, setDuration] = useState('3600000'); // 1 hour

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `/api/monitoring/metrics?metric=${metric}&duration=${duration}`
      );
      const metrics = await response.json();
      setData(metrics);
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [metric, duration]);

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Metrics History</h3>
          <div className="flex items-center space-x-2">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpu">CPU Usage</SelectItem>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="queueSize">Queue Size</SelectItem>
                <SelectItem value="errorRate">Error Rate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3600000">1 Hour</SelectItem>
                <SelectItem value="86400000">24 Hours</SelectItem>
                <SelectItem value="604800000">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}