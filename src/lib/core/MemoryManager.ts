export class MemoryManager {
  private static instance: MemoryManager;
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MODEL_CACHE_TIME = 30 * 60 * 1000; // 30 minutes
  private modelLastUsed: Map<string, number> = new Map();
  private cacheSize = 0;

  private constructor() {
    this.startCleanupTask();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  private startCleanupTask() {
    setInterval(() => {
      this.performCleanup();
    }, 60000); // Every minute
  }

  async performCleanup() {
    // Clear unused audio buffers
    this.cleanupAudioBuffers();

    // Clear old cache entries
    this.cleanupCache();

    // Release unused model memory
    await this.cleanupUnusedModels();

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }

  private cleanupAudioBuffers() {
    // Implement audio buffer cleanup
    const audioElements = document.getElementsByTagName('audio');
    for (const audio of audioElements) {
      if (audio.paused && !audio.dataset.keep) {
        audio.src = '';
        audio.load();
      }
    }
  }

  private cleanupCache() {
    if (this.cacheSize > this.MAX_CACHE_SIZE) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          if (!key.includes('critical')) {
            caches.delete(key);
          }
        });
      });
    }
  }

  async cleanupUnusedModels() {
    const now = Date.now();
    for (const [modelId, lastUsed] of this.modelLastUsed.entries()) {
      if (now - lastUsed > this.MODEL_CACHE_TIME) {
        await this.unloadModel(modelId);
      }
    }
  }

  private async unloadModel(modelId: string) {
    // Implement model unloading
    this.modelLastUsed.delete(modelId);
    // Additional cleanup logic
  }

  updateModelUsage(modelId: string) {
    this.modelLastUsed.set(modelId, Date.now());
  }
}