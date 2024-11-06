import { ProcessingOptions, ProcessingProgress } from '@/types/audio';
import { db } from '@/lib/db';
import { AudioProcessor } from '../audio/processor';
import { uploadToR2, deleteFromR2 } from '../cloudflare';

export class ProcessingQueue {
  private static instance: ProcessingQueue;
  private isProcessing = false;
  private currentProjectId: string | null = null;

  private constructor() {
    this.processNext();
  }

  static getInstance(): ProcessingQueue {
    if (!ProcessingQueue.instance) {
      ProcessingQueue.instance = new ProcessingQueue();
    }
    return ProcessingQueue.instance;
  }

  private async processNext() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;

      // Get next pending project
      const project = await db.project.findFirst({
        where: { status: 'pending' },
        include: { inputFile: true },
        orderBy: { createdAt: 'asc' },
      });

      if (!project) {
        this.isProcessing = false;
        return;
      }

      this.currentProjectId = project.id;

      // Update project status
      await db.project.update({
        where: { id: project.id },
        data: { status: 'processing' },
      });

      // Process audio
      const processor = AudioProcessor.getInstance();
      await processor.initialize();

      const response = await fetch(project.inputFile!.url);
      const audioData = await response.arrayBuffer();

      // Process with settings
      const settings = project.settings as ProcessingOptions;
      const processedBuffer = await processor.processAudio(audioData, settings);

      // Upload processed file
      const outputKey = `${project.userId}/processed-${Date.now()}.wav`;
      const outputUrl = await uploadToR2(
        Buffer.from(processedBuffer),
        outputKey,
        'audio/wav'
      );

      // Update project
      await db.project.update({
        where: { id: project.id },
        data: {
          status: 'completed',
          outputFiles: {
            create: {
              name: `${project.name}-processed.wav`,
              url: outputUrl,
              type: 'audio',
              format: 'audio/wav',
              size: processedBuffer.byteLength,
              duration: project.inputFile!.duration,
            },
          },
        },
      });
    } catch (error) {
      console.error('Processing error:', error);
      if (this.currentProjectId) {
        await db.project.update({
          where: { id: this.currentProjectId },
          data: { status: 'failed' },
        });
      }
    } finally {
      this.isProcessing = false;
      this.currentProjectId = null;
      // Process next item in queue
      setTimeout(() => this.processNext(), 1000);
    }
  }

  async getProgress(projectId: string): Promise<ProcessingProgress> {
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    switch (project.status) {
      case 'pending':
        return { status: 'queued', progress: 0 };
      case 'processing':
        return { status: 'processing', progress: 50 };
      case 'completed':
        return { status: 'completed', progress: 100 };
      case 'failed':
        return { 
          status: 'failed', 
          progress: 0, 
          error: 'Processing failed. Please try again.' 
        };
      default:
        return { status: 'queued', progress: 0 };
    }
  }
}