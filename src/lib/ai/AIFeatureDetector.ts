import { AdaptiveAIManager } from './AdaptiveAIManager';
import { SystemMonitor } from '../monitoring/SystemMonitor';
import { ErrorManager } from '../core/ErrorManager';

export class AIFeatureDetector {
  private static instance: AIFeatureDetector;
  private systemMonitor: SystemMonitor;
  private errorManager: ErrorManager;
  private capabilities: Map<string, boolean> = new Map();
  private extensionFeatures: Map<string, string[]> = new Map();

  private constructor() {
    this.systemMonitor = SystemMonitor.getInstance();
    this.errorManager = ErrorManager.getInstance();
  }

  static getInstance(): AIFeatureDetector {
    if (!AIFeatureDetector.instance) {
      AIFeatureDetector.instance = new AIFeatureDetector();
    }
    return AIFeatureDetector.instance;
  }

  async detectCapabilities(): Promise<Map<string, boolean>> {
    try {
      // Detect Safari Neural Engine
      this.capabilities.set('neuralEngine', await this.detectNeuralEngine());

      // Detect Chrome ML
      this.capabilities.set('chromeML', await this.detectChromeML());

      // Detect WebNN
      this.capabilities.set('webNN', await this.detectWebNN());

      // Detect local models
      const localModels = await this.detectLocalModels();
      this.capabilities.set('localModels', localModels.length > 0);

      // Detect AI extensions
      const extensions = await this.detectAIExtensions();
      this.capabilities.set('extensions', extensions.length > 0);

      // Store extension features for later use
      extensions.forEach(ext => {
        this.extensionFeatures.set(ext.id, ext.features);
      });

      return this.capabilities;
    } catch (error) {
      await this.errorManager.handleError(error, {
        context: 'capability_detection'
      });
      return new Map();
    }
  }

  private async detectNeuralEngine(): Promise<boolean> {
    // Check for Safari-specific Neural Engine features
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (!isSafari) return false;

    try {
      // Check for ANE-specific APIs
      return !!(
        'MLModel' in window ||
        'ANEDevice' in window ||
        'MLComputeDevice' in window
      );
    } catch {
      return false;
    }
  }

  private async detectChromeML(): Promise<boolean> {
    try {
      // Check for Chrome ML API
      if (!('chrome' in window)) return false;

      // Check for specific ML features
      return !!(
        'ml' in navigator &&
        'createImageClassifier' in (navigator as any).ml &&
        'createObjectDetector' in (navigator as any).ml
      );
    } catch {
      return false;
    }
  }

  private async detectWebNN(): Promise<boolean> {
    try {
      // Check for WebNN API
      return !!(
        'ml' in navigator &&
        'getNeuralNetworkContext' in (navigator as any).ml
      );
    } catch {
      return false;
    }
  }

  private async detectLocalModels(): Promise<Array<{
    id: string;
    type: string;
    version: string;
    features: string[];
  }>> {
    const models = [];

    try {
      // Check for IndexedDB-stored models
      if ('indexedDB' in window) {
        const db = await this.openModelDB();
        const storedModels = await db.getAll('models');
        models.push(...storedModels);
      }

      // Check for models in Cache Storage
      if ('caches' in window) {
        const cache = await caches.open('ai-models');
        const keys = await cache.keys();
        const modelKeys = keys.filter(key => key.url.includes('/models/'));
        
        for (const key of modelKeys) {
          const response = await cache.match(key);
          if (response) {
            const model = await response.json();
            models.push(model);
          }
        }
      }

      return models;
    } catch {
      return [];
    }
  }

  private async detectAIExtensions(): Promise<Array<{
    id: string;
    name: string;
    features: string[];
  }>> {
    const extensions = [];

    try {
      // Chrome Extensions API
      if ('chrome' in window && chrome.runtime) {
        // Query installed AI extensions
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'GET_AI_CAPABILITIES' },
            (response) => resolve(response)
          );
        });

        if (response && Array.isArray(response)) {
          extensions.push(...response);
        }
      }

      // Safari Extensions API
      if ('safari' in window && (safari as any).extension) {
        const response = await new Promise((resolve) => {
          (safari as any).extension.dispatchMessage(
            'getAICapabilities',
            { callback: resolve }
          );
        });

        if (response && Array.isArray(response)) {
          extensions.push(...response);
        }
      }

      return extensions;
    } catch {
      return [];
    }
  }

  private async openModelDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ai-models', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' });
        }
      };
    });
  }

  async getAvailableFeatures(): Promise<string[]> {
    const features: string[] = [];

    // Add features based on detected capabilities
    if (this.capabilities.get('neuralEngine')) {
      features.push(
        'hardware_acceleration',
        'neural_processing',
        'real_time_inference'
      );
    }

    if (this.capabilities.get('chromeML')) {
      features.push(
        'image_classification',
        'object_detection',
        'pose_estimation'
      );
    }

    if (this.capabilities.get('webNN')) {
      features.push(
        'neural_networks',
        'tensor_operations',
        'hardware_acceleration'
      );
    }

    // Add extension features
    for (const extFeatures of this.extensionFeatures.values()) {
      features.push(...extFeatures);
    }

    return [...new Set(features)]; // Remove duplicates
  }

  async getBestProviderForTask(task: string): Promise<string | null> {
    const providers = {
      'image_processing': ['neuralEngine', 'chromeML'],
      'audio_processing': ['neuralEngine', 'webNN'],
      'object_detection': ['chromeML', 'webNN'],
      'pose_estimation': ['chromeML'],
      'text_processing': ['webNN', 'localModels']
    };

    const preferredProviders = providers[task] || [];
    
    for (const provider of preferredProviders) {
      if (this.capabilities.get(provider)) {
        return provider;
      }
    }

    return null;
  }
}