import { SystemMonitor } from './SystemMonitor';
import { db } from '../db';

interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, MetricData[]>;
  private readonly MAX_HISTORY = 1000;
  private systemMonitor: SystemMonitor;

  private constructor() {
    this.metrics = new Map();
    this.systemMonitor = SystemMonitor.getInstance();
    this.initializeMetrics();
    this.startCollecting();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private initializeMetrics() {
    this.metrics.set('cpu_usage', []);
    this.metrics.set('memory_usage', []);
    this.metrics.set('queue_size', []);
    this.metrics.set('processing_time', []);
    this.metrics.set('error_rate', []);
    this.metrics.set('active_users', []);
    this.metrics.set('storage_usage', []);
    this.metrics.set('api_latency', []);
  }

  private startCollecting() {
    setInterval(async () => {
      await this.collectSystemMetrics();
      await this.collectQueueMetrics();
      await this.collectStorageMetrics();
      await this.persistMetrics();
    }, 60000); // Every minute
  }

  private async collectSystemMetrics() {
    const health = this.systemMonitor.getSystemHealth();
    await this.trackMetric('system_health', health.status === 'healthy' ? 1 : 0, {
      issues: health.issues
    });
  }

  private async collectQueueMetrics() {
    const queueMetrics = await this.getQueueMetrics();
    await this.trackMetric('queue_size', queueMetrics.size);
    await this.trackMetric('processing_time', queueMetrics.averageLatency);
  }

  private async collectStorageMetrics() {
    // Implement storage metrics collection
  }

  async trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricData: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    const values = this.metrics.get(name)!;
    values.push(metricData);

    // Keep only recent history
    if (values.length > this.MAX_HISTORY) {
      values.shift();
    }

    // Store in database
    await this.persistMetric(metricData);
  }

  private async persistMetric(metric: MetricData) {
    try {
      await db.metric.create({
        data: {
          name: metric.name,
          value: metric.value,
          timestamp: new Date(metric.timestamp),
          metadata: metric.metadata
        }
      });
    } catch (error) {
      console.error('Failed to persist metric:', error);
    }
  }

  private async persistMetrics() {
    const allMetrics: MetricData[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    try {
      await db.metric.createMany({
        data: allMetrics.map(m => ({
          name: m.name,
          value: m.value,
          timestamp: new Date(m.timestamp),
          metadata: m.metadata
        }))
      });
    } catch (error) {
      console.error('Failed to persist metrics:', error);
    }
  }

  async getMetricHistory(
    name: string,
    duration: number = 3600000 // 1 hour
  ): Promise<MetricData[]> {
    const cutoff = Date.now() - duration;
    const metrics = this.metrics.get(name) || [];
    return metrics.filter(m => m.timestamp >= cutoff);
  }

  async getQueueMetrics() {
    const queueSizes = await this.getMetricHistory('queue_size');
    const processingTimes = await this.getMetricHistory('processing_time');

    return {
      size: queueSizes[queueSizes.length - 1]?.value || 0,
      averageLatency: this.calculateAverage(processingTimes.map(m => m.value)),
      historical: {
        queueSizes: queueSizes.slice(-10),
        processingTimes: processingTimes.slice(-10)
      }
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}