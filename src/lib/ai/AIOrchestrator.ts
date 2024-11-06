import { AIFeatureDetector } from './AIFeatureDetector';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';
import { ModelManager } from '../models/ModelManager';

interface AITask {
  type: string;
  data: any;
  requirements?: {
    accuracy?: number;
    speed?: number;
    features?: string[];
  };
}

export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private featureDetector: AIFeatureDetector;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;
  private modelManager: ModelManager;
  private activeProviders: Map<string, boolean> = new Map();
  private taskQueue: AITask[] = [];

  private constructor() {
    this.featureDetector = AIFeatureDetector.getInstance();
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
    this.modelManager = ModelManager.getInstance();
    this.initialize();
  }

  static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  private async initialize() {
    try {
      // Detect available AI capabilities
      const capabilities = await this.featureDetector.detectCapabilities();
      
      // Initialize providers based on capabilities
      for (const [provider, available] of capabilities) {
        if (available) {
          await this.initializeProvider(provider);
        }
      }

      // Start monitoring
      this.startMonitoring();
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'ai_orchestrator_init'
      });
    }
  }

  private async initializeProvider(provider: string): Promise<void> {
    try {
      switch (provider) {
        case 'neuralEngine':
          await this.initializeNeuralEngine();
          break;
        case 'chromeML':
          await this.initializeChromeML();
          break;
        case 'webNN':
          await this.initializeWebNN();
          break;
        case 'localModels':
          await this.initializeLocalModels();
          break;
      }

      this.activeProviders.set(provider, true);
    } catch (error) {
      console.warn(`Failed to initialize ${provider}:`, error);
      this.activeProviders.set(provider, false);
    }
  }

  private async initializeNeuralEngine(): Promise<void> {
    // Initialize Safari Neural Engine
    const model = await this.modelManager.loadModel('neural-engine-core');
    await model.initialize();
  }

  private async initializeChromeML(): Promise<void> {
    // Initialize Chrome ML APIs
    const ml = (navigator as any).ml;
    await Promise.all([
      ml.createImageClassifier(),
      ml.createObjectDetector()
    ]);
  }

  private async initializeWebNN(): Promise<void> {
    // Initialize WebNN context
    const ml = (navigator as any).ml;
    const context = await ml.getNeuralNetworkContext();
    await context.initialize();
  }

  private async initializeLocalModels(): Promise<void> {
    // Load cached models
    const models = await this.modelManager.getLocalModels();
    await Promise.all(
      models.map(model => this.modelManager.loadModel(model.id))
    );
  }

  private startMonitoring() {
    setInterval(async () => {
      await this.monitorPerformance();
      await this.processTaskQueue();
    }, 1000);
  }

  private async monitorPerformance() {
    const metrics = await this.systemMonitor.getMetrics();
    
    // Adjust active providers based on performance
    for (const [provider, active] of this.activeProviders) {
      if (active && this.shouldDisableProvider(provider, metrics)) {
        this.activeProviders.set(provider, false);
        await this.handleProviderDisabled(provider);
      }
    }
  }

  private shouldDisableProvider(provider: string, metrics: any): boolean {
    const thresholds = {
      neuralEngine: { cpu: 90, memory: 85 },
      chromeML: { cpu: 85, memory: 80 },
      webNN: { cpu: 80, memory: 75 }
    };

    const threshold = thresholds[provider];
    if (!threshold) return false;

    return metrics.cpu > threshold.cpu || metrics.memory > threshold.memory;
  }

  private async handleProviderDisabled(provider: string) {
    // Migrate tasks to alternative providers
    const tasks = this.taskQueue.filter(task => 
      this.getBestProviderForTask(task.type) === provider
    );

    for (const task of tasks) {
      await this.reassignTask(task);
    }
  }

  private async reassignTask(task: AITask) {
    const alternativeProvider = await this.findAlternativeProvider(task);
    if (alternativeProvider) {
      task.requirements = {
        ...task.requirements,
        preferredProvider: alternativeProvider
      };
    }
  }

  private async findAlternativeProvider(task: AITask): Promise<string | null> {
    const providers = Array.from(this.activeProviders.entries())
      .filter(([_, active]) => active)
      .map(([provider]) => provider);

    // Find best alternative based on task requirements
    for (const provider of providers) {
      if (await this.canHandleTask(provider, task)) {
        return provider;
      }
    }

    return null;
  }

  private async canHandleTask(provider: string, task: AITask): Promise<boolean> {
    const features = await this.featureDetector.getAvailableFeatures();
    const requiredFeatures = task.requirements?.features || [];

    return requiredFeatures.every(feature => features.includes(feature));
  }

  async processTask(task: AITask): Promise<any> {
    try {
      const provider = await this.featureDetector.getBestProviderForTask(task.type);
      if (!provider) {
        throw new Error(`No suitable provider found for task: ${task.type}`);
      }

      return await this.executeTask(task, provider);
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'task_processing',
        task
      });
      throw error;
    }
  }

  private async executeTask(task: AITask, provider: string): Promise<any> {
    switch (provider) {
      case 'neuralEngine':
        return this.executeNeuralEngineTask(task);
      case 'chromeML':
        return this.executeChromeMlTask(task);
      case 'webNN':
        return this.executeWebNNTask(task);
      case 'localModels':
        return this.executeLocalModelTask(task);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async executeNeuralEngineTask(task: AITask): Promise<any> {
    const model = await this.modelManager.getModel('neural-engine-core');
    return model.process(task.data);
  }

  private async executeChromeMlTask(task: AITask): Promise<any> {
    const ml = (navigator as any).ml;
    switch (task.type) {
      case 'image_classification':
        const classifier = await ml.createImageClassifier();
        return classifier.classify(task.data);
      case 'object_detection':
        const detector = await ml.createObjectDetector();
        return detector.detect(task.data);
      default:
        throw new Error(`Unsupported Chrome ML task: ${task.type}`);
    }
  }

  private async executeWebNNTask(task: AITask): Promise<any> {
    const ml = (navigator as any).ml;
    const context = await ml.getNeuralNetworkContext();
    const model = await context.loadModel(task.type);
    return model.compute(task.data);
  }

  private async executeLocalModelTask(task: AITask): Promise<any> {
    const model = await this.modelManager.getLocalModel(task.type);
    return model.process(task.data);
  }
}