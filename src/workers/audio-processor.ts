import { Queue, QueueMessage } from '@cloudflare/workers-types';
import { AudioProcessor } from '../lib/audio/processor';
import { uploadToR2, deleteFromR2 } from '../lib/cloudflare';

interface AudioProcessingJob {
  projectId: string;
  fileKey: string;
  settings: any;
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    return new Response('Audio processor worker running');
  },

  async queue(batch: MessageBatch<AudioProcessingJob>, env: any, ctx: ExecutionContext) {
    const processor = AudioProcessor.getInstance();
    await processor.initialize();

    const results = await Promise.allSettled(
      batch.messages.map(async (message) => {
        const { projectId, fileKey, settings } = message.body;

        try {
          // Get file from R2
          const file = await env.STORAGE.get(fileKey);
          if (!file) throw new Error('File not found');

          const audioData = await file.arrayBuffer();
          const processedBuffer = await processor.processAudio(audioData, settings);

          // Upload processed file
          const outputKey = `processed/${projectId}/${Date.now()}.wav`;
          const outputUrl = await uploadToR2(
            Buffer.from(processedBuffer),
            outputKey,
            'audio/wav'
          );

          // Update database
          await env.DB.prepare(`
            UPDATE projects
            SET status = 'completed', output_url = ?
            WHERE id = ?
          `).bind(outputUrl, projectId).run();

          // Clear cache
          await env.CACHE.delete(`project:${projectId}`);

          message.ack();
        } catch (error) {
          console.error(`Processing failed for project ${projectId}:`, error);
          message.retry();
        }
      })
    );

    return results;
  }
};