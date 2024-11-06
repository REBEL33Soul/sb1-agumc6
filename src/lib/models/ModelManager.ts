import { AudioModel } from '../../types/audio';
import { PlatformOptimizer } from '../platform/PlatformOptimizer';
import { createWorker } from '../workers/modelWorker';

export class ModelManager {
  private static instance: ModelManager;
  private models: Map<string, AudioModel> = new Map();
  private workers: Worker[] = [];
  private platformOptimizer: PlatformOptimizer;

  private constructor() {
    this.platformOptimizer = PlatformOptimizer.getInstance();
    this.initializeWorkers();
  }

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private initializeWorkers() {
    const cores = navigator.hardwareConcurrency || 4;
    const optimalWorkers = Math.min(cores - 1, 4);
    
    for (let i = 0; i < optimalWorkers; i++) {
      const worker = createWorker();
      this.workers.push(worker);
    }
  }

  async loadModel(modelId: string): Promise<void> {
    if (this.models.has(modelId)) {
      return;
    }

    const config = this.platformOptimizer.getOptimalModelConfig();
    const model: AudioModel = {
      id: modelId,
      name: `Model-${modelId}`,
      version: '1.0.0',
      status: 'loading'
    };

    try {
      this.models.set(modelId, model);
      await this.loadModelImplementation(modelId, config);
      model.status = 'ready';
    } catch (error) {
      model.status = 'error';
      throw error;
    }
  }

  private async loadModelImplementation(modelId: string, config: any): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async unloadModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) return;
    this.models.delete(modelId);
  }

  getModel(modelId: string): AudioModel | undefined {
    return this.models.get(modelId);
  }

  cleanup() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.models.clear();
  }
}