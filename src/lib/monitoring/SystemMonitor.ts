import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorTracker } from './ErrorTracker';
import { MetricsCollector } from './MetricsCollector';

interface SystemMetrics {
  cpu: number;
  memory: number;
  queueSize: number;
  activeWorkers: number;
  errorRate: number;
  processingLatency: number;
}

export class SystemMonitor {
  private static instance: SystemMonitor;
  private performanceMonitor: PerformanceMonitor;
  private errorTracker: ErrorTracker;
  private metricsCollector: MetricsCollector;
  private alertThresholds: Map<string, number>;

  private constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.errorTracker = ErrorTracker.getInstance();
    this.metricsCollector = MetricsCollector.getInstance();
    this.alertThresholds = new Map([
      ['cpu', 80], // 80% CPU usage
      ['memory', 85], // 85% memory usage
      ['queueSize', 1000], // 1000 items in queue
      ['errorRate', 5], // 5% error rate
      ['processingLatency', 30000], // 30 seconds
    ]);

    this.startMonitoring();
  }

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  private startMonitoring() {
    setInterval(async () => {
      const metrics = await this.collectMetrics();
      this.analyzeMetrics(metrics);
      await this.storeMetrics(metrics);
    }, 60000); // Every minute
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const perfMetrics = this.performanceMonitor.getMetrics();
    const errorMetrics = this.errorTracker.getMetrics();
    const queueMetrics = await this.metricsCollector.getQueueMetrics();

    return {
      cpu: perfMetrics.cpuUsage,
      memory: perfMetrics.memoryUsage,
      queueSize: queueMetrics.size,
      activeWorkers: queueMetrics.activeWorkers,
      errorRate: errorMetrics.errorRate,
      processingLatency: queueMetrics.averageLatency,
    };
  }

  private analyzeMetrics(metrics: SystemMetrics) {
    // Check thresholds and trigger alerts
    for (const [metric, value] of Object.entries(metrics)) {
      const threshold = this.alertThresholds.get(metric);
      if (threshold && value > threshold) {
        this.triggerAlert(metric, value, threshold);
      }
    }

    // Auto-scaling logic
    if (metrics.queueSize > 500 || metrics.processingLatency > 20000) {
      this.scaleUp();
    } else if (metrics.queueSize < 100 && metrics.activeWorkers > 1) {
      this.scaleDown();
    }
  }

  private async storeMetrics(metrics: SystemMetrics) {
    try {
      await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: Date.now(),
          metrics,
        }),
      });
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  private triggerAlert(metric: string, value: number, threshold: number) {
    const alert = {
      type: 'system_alert',
      severity: this.getAlertSeverity(metric, value, threshold),
      message: `${metric} threshold exceeded: ${value} (threshold: ${threshold})`,
      timestamp: Date.now(),
    };

    // Send alert to monitoring service
    this.notifyTeam(alert);
  }

  private getAlertSeverity(
    metric: string,
    value: number,
    threshold: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const deviation = (value - threshold) / threshold;

    if (deviation > 0.5) return 'critical';
    if (deviation > 0.25) return 'high';
    if (deviation > 0.1) return 'medium';
    return 'low';
  }

  private async notifyTeam(alert: any) {
    try {
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  private async scaleUp() {
    try {
      await fetch('/api/workers/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'up' }),
      });
    } catch (error) {
      console.error('Failed to scale up workers:', error);
    }
  }

  private async scaleDown() {
    try {
      await fetch('/api/workers/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'down' }),
      });
    } catch (error) {
      console.error('Failed to scale down workers:', error);
    }
  }

  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    issues: string[];
  } {
    const metrics = this.performanceMonitor.getMetrics();
    const errors = this.errorTracker.getErrors();
    const issues: string[] = [];

    if (metrics.memoryUsage > 90) {
      issues.push('Critical memory usage');
    }
    if (metrics.cpuUsage > 85) {
      issues.push('High CPU utilization');
    }
    if (errors.length > 10) {
      issues.push('High error rate');
    }

    return {
      status: issues.length === 0 ? 'healthy' : 
              issues.length < 2 ? 'degraded' : 'critical',
      issues,
    };
  }
}