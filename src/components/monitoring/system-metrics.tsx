import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Cpu, Memory, Server, AlertTriangle } from 'lucide-react';

export function SystemMetrics() {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    queueSize: 0,
    errorRate: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/monitoring/metrics');
      const data = await response.json();
      setMetrics(data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="flex items-center space-x-4">
          <Cpu className="h-8 w-8 text-blue-400" />
          <div>
            <p className="text-sm text-gray-400">CPU Usage</p>
            <p className="text-2xl font-bold text-white">{metrics.cpu}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="flex items-center space-x-4">
          <Memory className="h-8 w-8 text-green-400" />
          <div>
            <p className="text-sm text-gray-400">Memory Usage</p>
            <p className="text-2xl font-bold text-white">{metrics.memory}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="flex items-center space-x-4">
          <Server className="h-8 w-8 text-purple-400" />
          <div>
            <p className="text-sm text-gray-400">Queue Size</p>
            <p className="text-2xl font-bold text-white">{metrics.queueSize}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        <div className="flex items-center space-x-4">
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
          <div>
            <p className="text-sm text-gray-400">Error Rate</p>
            <p className="text-2xl font-bold text-white">{metrics.errorRate}%</p>
          </div>
        </div>
      </Card>
    </>
  );
}