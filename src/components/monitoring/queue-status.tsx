import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QueueItem {
  id: string;
  status: string;
  progress: number;
}

export function QueueStatus() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    const fetchQueue = async () => {
      const response = await fetch('/api/monitoring/queue');
      const data = await response.json();
      setQueue(data);
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Processing Queue</h3>
        
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Project {item.id}</span>
                <span className="text-gray-400">{item.status}</span>
              </div>
              <Progress value={item.progress} />
            </div>
          ))}

          {queue.length === 0 && (
            <p className="text-center text-gray-400 py-4">No items in queue</p>
          )}
        </div>
      </div>
    </Card>
  );
}