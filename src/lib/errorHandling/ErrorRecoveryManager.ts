import { BaseErrorHandler, type ErrorReport } from './BaseErrorHandler';
import { ModelManager } from '../models/ModelManager';
import { PlatformOptimizer } from '../platform/PlatformOptimizer';

export class ErrorRecoveryManager extends BaseErrorHandler {
  private static instance: ErrorRecoveryManager;
  private recoveryAttempts: Map<string, number> = new Map();
  private readonly MAX_RECOVERY_ATTEMPTS = 3;

  private constructor() {
    super();
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  private setupGlobalErrorHandlers() {
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
      event.preventDefault();
    });

    window.addEventListener('error', (event) => {
      this.handleError(event.error);
      event.preventDefault();
    });
  }

  async handleError(error: Error): Promise<boolean> {
    const errorKey = this.getErrorKey(error);
    const attempts = this.recoveryAttempts.get(errorKey) || 0;

    if (attempts >= this.MAX_RECOVERY_ATTEMPTS) {
      const report = BaseErrorHandler.createErrorReport(error, 'critical', { recoveryAttempts: attempts });
      await this.logError(report);
      return false;
    }

    this.recoveryAttempts.set(errorKey, attempts + 1);

    try {
      const recovered = await this.attemptRecovery(error);
      if (recovered) {
        this.recoveryAttempts.delete(errorKey);
        return true;
      }
    } catch (recoveryError) {
      const report = BaseErrorHandler.createErrorReport(
        recoveryError instanceof Error ? recoveryError : new Error(String(recoveryError)),
        'high',
        { originalError: error }
      );
      await this.logError(report);
    }

    return false;
  }

  private getErrorKey(error: Error): string {
    return `${error.name}:${error.message}`;
  }

  private async attemptRecovery(error: Error): Promise<boolean> {
    const recoveryStrategies = [
      this.resetModelManager.bind(this),
      this.reinitializePlatform.bind(this),
      this.clearApplicationState.bind(this),
    ];

    for (const strategy of recoveryStrategies) {
      try {
        await strategy(error);
        return true;
      } catch (strategyError) {
        console.warn('Recovery strategy failed:', strategyError);
        continue;
      }
    }

    return false;
  }

  private async resetModelManager(error: Error): Promise<void> {
    if (error.message.includes('model') || error.message.includes('audio')) {
      const modelManager = ModelManager.getInstance();
      modelManager.cleanup();
      await modelManager.loadModel('default-model');
    }
  }

  private async reinitializePlatform(error: Error): Promise<void> {
    if (error.message.includes('platform') || error.message.includes('capability')) {
      const platform = PlatformOptimizer.getInstance();
      const config = platform.getOptimalModelConfig();
      await this.applyNewConfiguration(config);
    }
  }

  private async applyNewConfiguration(config: any): Promise<void> {
    const modelManager = ModelManager.getInstance();
    modelManager.cleanup();
    await modelManager.loadModel('default-model');
  }

  private async clearApplicationState(error: Error): Promise<void> {
    localStorage.clear();
    sessionStorage.clear();
    await this.clearCaches();
  }

  private async clearCaches(): Promise<void> {
    if ('caches' in window) {
      try {
        const keys = await window.caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      } catch (error) {
        console.warn('Cache clearing failed:', error);
      }
    }
  }

  getRecoveryAttempts(error: Error): number {
    return this.recoveryAttempts.get(this.getErrorKey(error)) || 0;
  }

  resetRecoveryCount(error: Error): void {
    this.recoveryAttempts.delete(this.getErrorKey(error));
  }
}