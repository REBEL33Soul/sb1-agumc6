import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';

interface AICapability {
  type: string;
  provider: string;
  version: string;
  features: string[];
  performance: {
    latency: number;
    accuracy: number;
    resourceUsage: number;
  };
}

export class AICapabilityDetector {
  private static instance: AICapabilityDetector;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;
  private capabilities: Map<string, AICapability> = new Map();

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
  }

  static getInstance(): AICapabilityDetector {
    if (!AICapabilityDetector.instance) {
      AICapabilityDetector.instance = new AICapabilityDetector();
    }
    return AICapabilityDetector.instance;
  }

  async detectCapabilities(): Promise<Map<string, AICapability>> {
    try {
      // Detect Safari Neural Engine
      if (await this.checkSafariNeuralEngine()) {
        this.capabilities.set('safari_neural_engine', {
          type: 'hardware',
          provider: 'apple',
          version: await this.getSafariVersion(),
          features: ['inference', 'image_processing', 'audio_processing'],
          performance: await this.benchmarkCapability('safari_neural_engine')
        });
      }

      // Detect Chrome ML
      if (await this.checkChromeML()) {
        this.capabilities.set('chrome_ml', {
          type: 'browser',
          provider: 'google',
          version: await this.getChromeVersion(),
          features: ['inference', 'image_classification', 'object_detection'],
          performance: await this.benchmarkCapability('chrome_ml')
        });
      }

      // Detect WebNN
      if (await this.checkWebNN()) {
        this.capabilities.set('webnn', {
          type: 'api',
          provider: 'w3c',
          version: '1.0',
          features: ['neural_networks', 'hardware_acceleration'],
          performance: await this.benchmarkCapability('webnn')
        });
      }

      // Detect Local Models
      const localModels = await this.detectLocalModels();
      for (const model of localModels) {
        this.capabilities.set(`local_${model.id}`, {
          type: 'local',
          provider: model.provider,
          version: model.version,
          features: model.features,
          performance: await this.benchmarkCapability(`local_${model.id}`)
        });
      }

      // Detect Browser Extensions
      const extensions = await this.detectAIExtensions();
      for (const ext of extensions) {
        this.capabilities.set(`extension_${ext.id}`, {
          type: 'extension',
          provider: ext.provider,
          version: ext.version,
          features: ext.features,
          performance: await this.benchmarkCapability(`extension_${ext.id}`)
        });
      }

      return this.capabilities;
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'ai_capability_detection'
      });
      return new Map();
    }
  }

  private async checkSafariNeuralEngine(): Promise<boolean> {
    try {
      // Check for Safari-specific ML features
      return 'MLModel' in window || 'ANEDevice' in window;
    } catch {
      return false;
    }
  }

  private async checkChromeML(): Promise<boolean> {
    try {
      // Check for Chrome ML API
      return 'ml' in navigator;
    } catch {
      return false;
    }
  }

  private async checkWebNN(): Promise<boolean> {
    try {
      // Check for WebNN API
      return 'ml' in navigator && 'getNeuralNetworkContext' in (navigator as any).ml;
    } catch {
      return false;
    }
  }

  private async detectLocalModels(): Promise<any[]> {
    const models = [];
    
    // Check for locally installed models
    if ('modelCache' in window) {
      const cache = (window as any).modelCache;
      const modelList = await cache.list();
      models.push(...modelList);
    }

    return models;
  }

  private async detectAIExtensions(): Promise<any[]> {
    const extensions = [];

    // Check for Chrome extensions
    if ('runtime' in chrome) {
      try {
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'CHECK_AI_CAPABILITIES' },
            response => {
              if (response && response.capabilities) {
                extensions.push(...response.capabilities);
              }
              resolve(true);
            }
          );
        });
      } catch {
        // Extension communication failed
      }
    }

    return extensions;
  }

  private async benchmarkCapability(id: string): Promise<{
    latency: number;
    accuracy: number;
    resourceUsage: number;
  }> {
    const metrics = await this.systemMonitor.getMetrics();
    const startTime = performance.now();
    
    // Run benchmark tests
    await this.runBenchmark(id);
    
    const endTime = performance.now();
    const newMetrics = await this.systemMonitor.getMetrics();

    return {
      latency: endTime - startTime,
      accuracy: await this.measureAccuracy(id),
      resourceUsage: newMetrics.memory - metrics.memory
    };
  }

  private async runBenchmark(id: string): Promise<void> {
    // Implement benchmark logic
  }

  private async measureAccuracy(id: string): Promise<number> {
    // Implement accuracy measurement
    return 1.0;
  }

  private async getSafariVersion(): Promise<string> {
    const ua = navigator.userAgent;
    const match = ua.match(/Version\/(\d+\.\d+)/);
    return match ? match[1] : '1.0';
  }

  private async getChromeVersion(): Promise<string> {
    const ua = navigator.userAgent;
    const match = ua.match(/Chrome\/(\d+\.\d+)/);
    return match ? match[1] : '1.0';
  }
}