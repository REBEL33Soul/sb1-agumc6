interface Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

declare global {
  interface Window {
    gc?: () => void;
  }
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private thresholds: Map<string, number> = new Map();

  private constructor() {
    this.setupDefaultThresholds();
    this.startMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupDefaultThresholds() {
    this.thresholds.set('audioLatency', 50);
    this.thresholds.set('memoryUsage', 0.8);
    this.thresholds.set('cpuUsage', 0.9);
  }

  private startMonitoring() {
    setInterval(() => {
      this.collectMetrics();
      this.analyzeMetrics();
    }, 1000);
  }

  private collectMetrics() {
    const memory = (performance as Performance).memory;
    if (memory) {
      this.addMetric('memoryUsage', memory.usedJSHeapSize / memory.jsHeapSizeLimit);
    }

    if (window.AudioContext) {
      const context = new AudioContext();
      this.addMetric('audioLatency', context.baseLatency * 1000);
      context.close();
    }
  }

  private addMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    if (values.length > 100) {
      values.shift();
    }
  }

  private analyzeMetrics() {
    for (const [name, values] of this.metrics.entries()) {
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      const threshold = this.thresholds.get(name);
      
      if (threshold && average > threshold) {
        this.handleThresholdExceeded(name, average, threshold);
      }
    }
  }

  private handleThresholdExceeded(metric: string, value: number, threshold: number) {
    console.warn(`Performance warning: ${metric} (${value.toFixed(2)}) exceeded threshold (${threshold})`);
    this.triggerRecoveryStrategy(metric);
  }

  private triggerRecoveryStrategy(metric: string) {
    switch (metric) {
      case 'memoryUsage':
        if (window.gc) {
          window.gc();
        }
        break;
      case 'audioLatency':
        break;
      case 'cpuUsage':
        break;
    }
  }

  getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [name, values] of this.metrics.entries()) {
      result[name] = values[values.length - 1];
    }
    return result;
  }
}