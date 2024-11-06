import { ErrorManager } from './ErrorManager';
import { HealthMonitor } from '../monitoring/HealthMonitor';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ModelManager } from '../models/ModelManager';

export class AutoHealer {
  private static instance: AutoHealer;
  private errorManager: ErrorManager;
  private healthMonitor: HealthMonitor;
  private systemMonitor: SystemMonitor;
  private modelManager: ModelManager;
  private healingStrategies: Map<string, () => Promise<boolean>>;
  private healingHistory: Array<{
    timestamp: number;
    component: string;
    success: boolean;
  }> = [];

  private constructor() {
    this.errorManager = ErrorManager.getInstance();
    this.healthMonitor = HealthMonitor.getInstance();
    this.systemMonitor = SystemMonitor.getInstance();
    this.modelManager = ModelManager.getInstance();
    this.healingStrategies = new Map();
    this.initializeStrategies();
  }

  static getInstance(): AutoHealer {
    if (!AutoHealer.instance) {
      AutoHealer.instance = new AutoHealer();
    }
    return AutoHealer.instance;
  }

  private initializeStrategies() {
    this.healingStrategies.set('audio', async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        await context.resume();
        return true;
      } catch {
        return false;
      }
    });

    this.healingStrategies.set('wasm', async () => {
      try {
        await this.modelManager.reloadModels();
        return true;
      } catch {
        return false;
      }
    });

    this.healingStrategies.set('memory', async () => {
      try {
        if (window.gc) {
          window.gc();
        }
        await this.clearCaches();
        return true;
      } catch {
        return false;
      }
    });

    this.healingStrategies.set('storage', async () => {
      try {
        await this.optimizeStorage();
        return true;
      } catch {
        return false;
      }
    });

    this.healingStrategies.set('models', async () => {
      try {
        await this.modelManager.cleanup();
        await this.modelManager.loadModel('default-model');
        return true;
      } catch {
        return false;
      }
    });
  }

  async heal(component: string): Promise<boolean> {
    try {
      const strategy = this.healingStrategies.get(component);
      if (!strategy) {
        throw new Error(`No healing strategy for component: ${component}`);
      }

      const success = await strategy();
      this.healingHistory.push({
        timestamp: Date.now(),
        component,
        success
      });

      if (!success) {
        await this.errorManager.handleError(
          new Error(`Healing failed for component: ${component}`),
          { context: 'auto_healing', component }
        );
      }

      return success;
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'auto_healing',
        component
      });
      return false;
    }
  }

  private async clearCaches() {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => !key.includes('critical'))
          .map(key => caches.delete(key))
      );
    }
  }

  private async optimizeStorage() {
    const quota = await navigator.storage.estimate();
    if ((quota.usage || 0) > (quota.quota || 0) * 0.8) {
      await this.clearTemporaryFiles();
    }
  }

  private async clearTemporaryFiles() {
    // Clear temporary storage
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key.includes('temp'))
          .map(key => caches.delete(key))
      );
    }
  }

  getHealingHistory(): Array<{
    timestamp: number;
    component: string;
    success: boolean;
  }> {
    return [...this.healingHistory];
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    metrics: any;
    healingHistory: Array<{
      timestamp: number;
      component: string;
      success: boolean;
    }>;
  }> {
    const health = await this.healthMonitor.getHealthStatus();
    return {
      ...health,
      healingHistory: this.getHealingHistory()
    };
  }
}