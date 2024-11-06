import { SystemMetrics } from '@/components/monitoring/system-metrics';
import { QueueStatus } from '@/components/monitoring/queue-status';
import { ErrorLog } from '@/components/monitoring/error-log';
import { WorkerStatus } from '@/components/monitoring/worker-status';
import { MetricsChart } from '@/components/monitoring/metrics-chart';

export default function MonitoringPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">System Monitoring</h2>
        <p className="text-gray-400 mt-2">Real-time system performance and metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SystemMetrics />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricsChart />
        <QueueStatus />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkerStatus />
        <ErrorLog />
      </div>
    </div>
  );
}