import { config } from '../../config/environment';

export class StorageManager {
  private static instance: StorageManager;
  private cache: Map<string, ArrayBuffer> = new Map();

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async loadModel(modelId: string): Promise<ArrayBuffer> {
    if (this.cache.has(modelId)) {
      return this.cache.get(modelId)!;
    }

    const url = `${config.cdn.modelEndpoint}/${modelId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load model: ${modelId}`);
    }

    const buffer = await response.arrayBuffer();
    this.cache.set(modelId, buffer);
    
    return buffer;
  }

  async saveAudio(audioData: ArrayBuffer, metadata: any): Promise<string> {
    const formData = new FormData();
    formData.append('audio', new Blob([audioData]));
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${config.storage.endpoint}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to save audio');
    }

    const { id } = await response.json();
    return id;
  }

  clearCache(): void {
    this.cache.clear();
  }
}