import { ProcessingQueue } from './processor';
import { AudioProcessor } from '../audio/processor';
import { db } from '@/lib/db';

export class BatchProcessor {
  private static instance: BatchProcessor;
  private queue: ProcessingQueue;
  private processor: AudioProcessor;
  private isProcessing = false;

  private constructor() {
    this.queue = ProcessingQueue.getInstance();
    this.processor = AudioProcessor.getInstance();
  }

  static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor();
    }
    return BatchProcessor.instance;
  }

  async processBatch(projectIds: string[]): Promise<void> {
    if (this.isProcessing) {
      throw new Error('Batch processing already in progress');
    }

    this.isProcessing = true;

    try {
      // Process projects in parallel with concurrency limit
      const concurrencyLimit = 3;
      const chunks = this.chunkArray(projectIds, concurrencyLimit);

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(projectId => this.processProject(projectId))
        );
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processProject(projectId: string): Promise<void> {
    try {
      await db.project.update({
        where: { id: projectId },
        data: { status: 'processing' },
      });

      const project = await db.project.findUnique({
        where: { id: projectId },
        include: { inputFile: true },
      });

      if (!project || !project.inputFile) {
        throw new Error('Project or input file not found');
      }

      // Process audio
      const response = await fetch(project.inputFile.url);
      const audioData = await response.arrayBuffer();
      
      await this.processor.processAudio(
        audioData,
        project.settings as any
      );

      await db.project.update({
        where: { id: projectId },
        data: { status: 'completed' },
      });
    } catch (error) {
      console.error(`Error processing project ${projectId}:`, error);
      await db.project.update({
        where: { id: projectId },
        data: { status: 'failed' },
      });
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async getBatchProgress(projectIds: string[]): Promise<Map<string, number>> {
    const progress = new Map<string, number>();

    for (const projectId of projectIds) {
      const project = await db.project.findUnique({
        where: { id: projectId },
      });

      if (!project) continue;

      switch (project.status) {
        case 'pending':
          progress.set(projectId, 0);
          break;
        case 'processing':
          progress.set(projectId, 50);
          break;
        case 'completed':
          progress.set(projectId, 100);
          break;
        case 'failed':
          progress.set(projectId, -1);
          break;
      }
    }

    return progress;
  }
}