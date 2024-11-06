import { ProcessingOptions } from '@/types/audio';

export class QueueManager {
  private static instance: QueueManager;
  private readonly CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

  private constructor() {}

  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  async enqueueAudioProcessing(
    projectId: string,
    file: File,
    settings: ProcessingOptions
  ): Promise<void> {
    // Split large files into chunks
    const chunks = await this.splitFileIntoChunks(file);
    
    // Upload chunks to R2
    const chunkKeys = await Promise.all(
      chunks.map(async (chunk, index) => {
        const key = `chunks/${projectId}/${index}.bin`;
        await this.uploadChunk(key, chunk);
        return key;
      })
    );

    // Add to processing queue
    await fetch('/api/queue/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        chunkKeys,
        settings,
      }),
    });
  }

  private async splitFileIntoChunks(file: File): Promise<Blob[]> {
    const chunks: Blob[] = [];
    let offset = 0;

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
      chunks.push(chunk);
      offset += this.CHUNK_SIZE;
    }

    return chunks;
  }

  private async uploadChunk(key: string, chunk: Blob): Promise<void> {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('key', key);

    await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });
  }
}