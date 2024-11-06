import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, CheckCircle, XCircle } from 'lucide-react';

interface Worker {
  id: string;
  status: 'active' | 'idle' | 'error';
  lastHeartbeat: string;
  currentTask?: string;
}

export function WorkerStatus() {
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    const fetchWorkers = async () => {
      const response = await fetch('/api/monitoring/workers');
      const data = await response.json();
      setWorkers(data);
    };

    fetchWorkers();
    const interval = setInterval(fetchWorkers, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Worker Status</h3>
        
        <div className="space-y-4">
          {workers.map((worker) => (
            <div
              key={worker.id}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {worker.status === 'active' && (
                  <Activity className="h-5 w-5 text-green-400" />
                )}
                {worker.status === 'idle' && (
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                )}
                {worker.status === 'error' && (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <div>
                  <p className="text-white">Worker {worker.id}</p>
                  <p className="text-sm text-gray-400">
                    Last heartbeat: {new Date(worker.lastHeartbeat).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {worker.currentTask && (
                <span className="text-sm text-gray-400">{worker.currentTask}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}