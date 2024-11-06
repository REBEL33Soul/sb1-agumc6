import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from './ErrorManager';
import { TieredStorage } from '../storage/TieredStorage';
import { QueueManager } from '../queue/manager';
import { RateLimiter } from '../security/rate-limiter';
import { CostManager } from '../billing/CostManager';

export class ResourceManager {
  private static instance: ResourceManager;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;
  private tieredStorage: TieredStorage;
  private queueManager: QueueManager;
  private rateLimiter: RateLimiter;
  private costManager: CostManager;

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
    this.tieredStorage = TieredStorage.getInstance();
    this.queueManager = QueueManager.getInstance();
    this.rateLimiter = RateLimiter.getInstance();
    this.costManager = CostManager.getInstance();
    this.startMonitoring();
  }

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  private startMonitoring() {
    setInterval(async () => {
      await this.checkResources();
    }, 60000); // Every minute
  }

  private async checkResources() {
    try {
      // Monitor system resources
      const metrics = await this.systemMonitor.getMetrics();
      
      // Check for resource spikes
      if (metrics.cpu > 80 || metrics.memory > 85) {
        await this.handleResourceSpike();
      }

      // Monitor storage usage
      const storageStats = await this.tieredStorage.getStorageStats();
      if (storageStats.totalSize > storageStats.maxSize * 0.8) {
        await this.optimizeStorage();
      }

      // Check costs
      const costMetrics = await this.costManager.getCurrentMetrics();
      if (costMetrics.projectedCost > costMetrics.budget) {
        await this.handleCostAlert();
      }
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'resource_monitoring'
      });
    }
  }

  private async handleResourceSpike() {
    // Scale up resources
    await this.queueManager.enableThrottling();
    await this.systemMonitor.triggerAlert('resource_spike');
  }

  private async optimizeStorage() {
    // Move cold data to lower-cost storage
    await this.tieredStorage.optimizeStorage();
    // Clean up expired files
    await this.tieredStorage.cleanupExpiredFiles();
  }

  private async handleCostAlert() {
    await this.costManager.triggerAlert();
    await this.optimizeResources();
  }

  private async optimizeResources() {
    // Implement resource optimization strategies
    await this.queueManager.optimizeQueues();
    await this.tieredStorage.compressInactiveStorage();
  }
}