import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function CostBreakdown() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/admin/metrics/costs');
      const costData = await response.json();
      setData([
        { name: 'Processing', value: costData.processing },
        { name: 'Storage', value: costData.storage },
        { name: 'Bandwidth', value: costData.bandwidth },
        { name: 'Overhead', value: costData.overhead },
      ]);
    };

    fetchData();
  }, []);

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}