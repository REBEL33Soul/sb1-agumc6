import { SystemMonitor } from './SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';
import { ModelManager } from '../models/ModelManager';

export class HealthMonitor {
  private static instance: HealthMonitor;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;
  private modelManager: ModelManager;
  private healthChecks: Map<string, () => Promise<boolean>>;
  private healthStatus: Map<string, boolean>;
  private checkInterval: number = 60000; // 1 minute

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
    this.modelManager = ModelManager.getInstance();
    this.healthChecks = new Map();
    this.healthStatus = new Map();
    this.initializeHealthChecks();
    this.startMonitoring();
  }

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  private initializeHealthChecks() {
    this.healthChecks.set('audio', async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        await context.close();
        return true;
      } catch {
        return false;
      }
    });

    this.healthChecks.set('wasm', async () => {
      try {
        const module = await WebAssembly.compile(new Uint8Array([
          0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
        ]));
        return !!module;
      } catch {
        return false;
      }
    });

    this.healthChecks.set('models', async () => {
      try {
        const model = await this.modelManager.loadModel('default-model');
        return !!model;
      } catch {
        return false;
      }
    });

    this.healthChecks.set('memory', async () => {
      const metrics = await this.systemMonitor.getMetrics();
      return metrics.memory.used < metrics.memory.total * 0.9;
    });

    this.healthChecks.set('storage', async () => {
      try {
        const quota = await navigator.storage.estimate();
        return (quota.usage || 0) < (quota.quota || 0) * 0.9;
      } catch {
        return true; // Don't fail if storage estimation is not available
      }
    });
  }

  private startMonitoring() {
    setInterval(async () => {
      await this.runHealthChecks();
    }, this.checkInterval);
  }

  private async runHealthChecks() {
    for (const [name, check] of this.healthChecks) {
      try {
        const result = await check();
        const previousStatus = this.healthStatus.get(name);
        this.healthStatus.set(name, result);

        if (previousStatus === true && !result) {
          await this.handleHealthFailure(name);
        } else if (previousStatus === false && result) {
          await this.handleHealthRecovery(name);
        }
      } catch (error) {
        await this.errorManager.handleError(error, {
          context: 'health_check',
          component: name
        });
      }
    }
  }

  private async handleHealthFailure(component: string) {
    try {
      switch (component) {
        case 'audio':
          await this.recoverAudioSystem();
          break;
        case 'wasm':
          await this.recoverWasmSystem();
          break;
        case 'models':
          await this.recoverModelSystem();
          break;
        case 'memory':
          await this.recoverMemorySystem();
          break;
        case 'storage':
          await this.recoverStorageSystem();
          break;
      }
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'health_recovery',
        component
      });
    }
  }

  private async handleHealthRecovery(component: string) {
    // Log recovery and notify monitoring system
    console.log(`Component ${component} has recovered`);
  }

  private async recoverAudioSystem() {
    // Attempt to reinitialize audio context
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    await context.resume();
  }

  private async recoverWasmSystem() {
    // Attempt to reload WebAssembly modules
    await this.modelManager.reloadModels();
  }

  private async recoverModelSystem() {
    // Clear model cache and reload
    await this.modelManager.cleanup();
    await this.modelManager.loadModel('default-model');
  }

  private async recoverMemorySystem() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    // Clear caches
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
  }

  private async recoverStorageSystem() {
    // Clear temporary storage
    try {
      const quota = await navigator.storage.estimate();
      if ((quota.usage || 0) > (quota.quota || 0) * 0.9) {
        await this.clearTemporaryStorage();
      }
    } catch {
      // Handle storage recovery failure
    }
  }

  private async clearTemporaryStorage() {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key.includes('temp'))
          .map(key => caches.delete(key))
      );
    }
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    metrics: any;
  }> {
    await this.runHealthChecks();

    const components = Object.fromEntries(this.healthStatus);
    const failedCount = Array.from(this.healthStatus.values())
      .filter(status => !status).length;

    return {
      status: failedCount === 0 ? 'healthy' :
              failedCount <= 2 ? 'degraded' : 'unhealthy',
      components,
      metrics: await this.systemMonitor.getMetrics()
    };
  }
}