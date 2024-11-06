import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export function ProfitMargins() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/admin/metrics/margins');
      const marginData = await response.json();
      setData(marginData);
    };

    fetchData();
  }, []);

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Profit Margins</h3>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => `${value.toFixed(2)}%`}
              />
              <Line
                type="monotone"
                dataKey="grossMargin"
                stroke="#3b82f6"
                name="Gross Margin"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="netMargin"
                stroke="#10b981"
                name="Net Margin"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="operatingMargin"
                stroke="#f59e0b"
                name="Operating Margin"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}