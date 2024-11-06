import { SystemMonitor } from '../monitoring/SystemMonitor';

export class NetworkOptimizer {
  private static instance: NetworkOptimizer;
  private systemMonitor: SystemMonitor;
  private http3Supported: boolean = false;

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.detectCapabilities();
  }

  static getInstance(): NetworkOptimizer {
    if (!NetworkOptimizer.instance) {
      NetworkOptimizer.instance = new NetworkOptimizer();
    }
    return NetworkOptimizer.instance;
  }

  private async detectCapabilities() {
    // Check for HTTP/3 support
    this.http3Supported = 'http3' in navigator;

    // Monitor connection quality
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.updateOptimizations();
      });
    }
  }

  async optimizeRequest(url: string): Promise<RequestInit> {
    const options: RequestInit = {
      cache: 'no-cache',
      credentials: 'same-origin',
    };

    if (this.http3Supported) {
      options.headers = {
        ...options.headers,
        'Alt-Svc': 'h3=":443"; ma=86400',
      };
    }

    // Add connection-aware priorities
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.saveData) {
        options.headers = {
          ...options.headers,
          'Save-Data': '1',
        };
      }

      if (connection.effectiveType === '4g') {
        options.priority = 'high';
      }
    }

    return options;
  }

  async prefetchResources(urls: string[]) {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.saveData) return; // Don't prefetch if data saver is enabled
    }

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  private async updateOptimizations() {
    // Implement dynamic optimization updates based on connection changes
  }
}