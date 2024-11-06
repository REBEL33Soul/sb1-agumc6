import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export function UsageMetrics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/admin/metrics/usage');
      const usageData = await response.json();
      setData(usageData);
    };

    fetchData();
  }, []);

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Usage Metrics</h3>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="app" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
              <Bar dataKey="storage" fill="#10b981" name="Storage (GB)" />
              <Bar dataKey="processing" fill="#f59e0b" name="Processing (hrs)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}