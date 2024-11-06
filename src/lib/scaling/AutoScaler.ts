import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';
import { MetricsCollector } from '../monitoring/MetricsCollector';

interface ScalingRule {
  metric: string;
  threshold: number;
  action: 'scale_up' | 'scale_down';
  cooldown: number;
}

export class AutoScaler {
  private static instance: AutoScaler;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;
  private metricsCollector: MetricsCollector;
  private lastScaleTime: number = 0;
  private readonly COOLDOWN_PERIOD = 300000; // 5 minutes

  private readonly scalingRules: ScalingRule[] = [
    {
      metric: 'cpu_usage',
      threshold: 80,
      action: 'scale_up',
      cooldown: 300000
    },
    {
      metric: 'memory_usage',
      threshold: 85,
      action: 'scale_up',
      cooldown: 300000
    },
    {
      metric: 'queue_size',
      threshold: 1000,
      action: 'scale_up',
      cooldown: 180000
    },
    {
      metric: 'cpu_usage',
      threshold: 20,
      action: 'scale_down',
      cooldown: 600000
    }
  ];

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
    this.metricsCollector = MetricsCollector.getInstance();
    this.startMonitoring();
  }

  static getInstance(): AutoScaler {
    if (!AutoScaler.instance) {
      AutoScaler.instance = new AutoScaler();
    }
    return AutoScaler.instance;
  }

  private startMonitoring() {
    setInterval(async () => {
      await this.checkScaling();
    }, 60000); // Check every minute
  }

  private async checkScaling() {
    try {
      const metrics = await this.systemMonitor.getMetrics();
      const now = Date.now();

      if (now - this.lastScaleTime < this.COOLDOWN_PERIOD) {
        return;
      }

      for (const rule of this.scalingRules) {
        const metricValue = metrics[rule.metric];
        
        if (rule.action === 'scale_up' && metricValue > rule.threshold) {
          await this.scaleUp();
          break;
        } else if (rule.action === 'scale_down' && metricValue < rule.threshold) {
          await this.scaleDown();
          break;
        }
      }
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'auto_scaling'
      });
    }
  }

  private async scaleUp(): Promise<void> {
    try {
      await fetch('/api/workers/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'up' })
      });
      this.lastScaleTime = Date.now();
    } catch (error) {
      console.error('Scale up failed:', error);
    }
  }

  private async scaleDown(): Promise<void> {
    try {
      await fetch('/api/workers/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'down' })
      });
      this.lastScaleTime = Date.now();
    } catch (error) {
      console.error('Scale down failed:', error);
    }
  }

  async getScalingMetrics(): Promise<{
    currentInstances: number;
    scalingHistory: any[];
    recommendations: string[];
  }> {
    const metrics = await this.metricsCollector.getMetricHistory('scaling');
    return {
      currentInstances: metrics[metrics.length - 1]?.value || 1,
      scalingHistory: metrics,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  private generateRecommendations(metrics: any[]): string[] {
    const recommendations: string[] = [];
    // Analyze metrics and generate scaling recommendations
    return recommendations;
  }
}