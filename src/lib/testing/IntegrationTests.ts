import { AudioProcessor } from '../audio/processor';
import { ModelManager } from '../models/ModelManager';
import { StorageManager } from '../storage/StorageManager';
import { QueueManager } from '../queue/manager';

export class IntegrationTests {
  private audioProcessor: AudioProcessor;
  private modelManager: ModelManager;
  private storageManager: StorageManager;
  private queueManager: QueueManager;

  constructor() {
    this.audioProcessor = AudioProcessor.getInstance();
    this.modelManager = ModelManager.getInstance();
    this.storageManager = StorageManager.getInstance();
    this.queueManager = QueueManager.getInstance();
  }

  async runTests(): Promise<{
    passed: number;
    failed: number;
    results: Array<{
      name: string;
      passed: boolean;
      duration: number;
      error?: string;
    }>;
  }> {
    const results = [];
    let passed = 0;
    let failed = 0;

    const tests = [
      this.testEndToEndProcessing.bind(this),
      this.testModelLoading.bind(this),
      this.testStorageOperations.bind(this),
      this.testQueueProcessing.bind(this),
      this.testConcurrentProcessing.bind(this)
    ];

    for (const test of tests) {
      const start = performance.now();
      try {
        await test();
        results.push({
          name: test.name,
          passed: true,
          duration: performance.now() - start
        });
        passed++;
      } catch (error) {
        results.push({
          name: test.name,
          passed: false,
          duration: performance.now() - start,
          error: error.message
        });
        failed++;
      }
    }

    return { passed, failed, results };
  }

  private async testEndToEndProcessing() {
    // Test complete processing pipeline
    const testFile = await this.createTestAudioFile();
    const projectId = await this.queueManager.enqueueAudioProcessing(
      testFile,
      {
        denoise: true,
        normalize: true,
        removeClipping: true,
        enhanceStereo: true
      }
    );

    // Wait for processing to complete
    let status;
    do {
      status = await this.queueManager.getProgress(projectId);
      await new Promise(resolve => setTimeout(resolve, 100));
    } while (status.status !== 'completed' && status.status !== 'failed');

    if (status.status !== 'completed') {
      throw new Error('End-to-end processing failed');
    }
  }

  private async testModelLoading() {
    // Test model loading and initialization
    const models = ['default-model', 'enhancement-model', 'immersive-model'];
    
    for (const modelId of models) {
      await this.modelManager.loadModel(modelId);
      const model = this.modelManager.getModel(modelId);
      
      if (!model) {
        throw new Error(`Failed to load model: ${modelId}`);
      }

      // Test basic inference
      const result = await model.process(new Float32Array(1024));
      if (!result) {
        throw new Error(`Model inference failed: ${modelId}`);
      }
    }
  }

  private async testStorageOperations() {
    // Test storage operations
    const testData = new Uint8Array([1, 2, 3, 4, 5]);
    const key = 'test-file';

    // Upload
    await this.storageManager.uploadToR2(
      Buffer.from(testData),
      key,
      'application/octet-stream'
    );

    // Download
    const downloaded = await this.storageManager.downloadFromR2(key);
    if (!downloaded) {
      throw new Error('File download failed');
    }

    // Compare
    const downloadedArray = new Uint8Array(downloaded);
    if (downloadedArray.length !== testData.length) {
      throw new Error('Downloaded file size mismatch');
    }

    for (let i = 0; i < testData.length; i++) {
      if (downloadedArray[i] !== testData[i]) {
        throw new Error('Downloaded file content mismatch');
      }
    }

    // Cleanup
    await this.storageManager.deleteFromR2(key);
  }

  private async testQueueProcessing() {
    // Test queue processing with multiple items
    const numItems = 5;
    const projectIds = [];

    // Enqueue multiple items
    for (let i = 0; i < numItems; i++) {
      const testFile = await this.createTestAudioFile();
      const projectId = await this.queueManager.enqueueAudioProcessing(
        testFile,
        {
          denoise: true,
          normalize: true,
          removeClipping: true,
          enhanceStereo: true
        }
      );
      projectIds.push(projectId);
    }

    // Wait for all to complete
    const results = await Promise.all(
      projectIds.map(id => this.waitForProcessing(id))
    );

    if (results.some(result => !result)) {
      throw new Error('Queue processing failed');
    }
  }

  private async testConcurrentProcessing() {
    // Test concurrent processing limits
    const concurrentLimit = 3;
    const totalTasks = 6;
    const startTimes = [];
    const endTimes = [];

    for (let i = 0; i < totalTasks; i++) {
      const testFile = await this.createTestAudioFile();
      const start = Date.now();
      startTimes.push(start);

      await this.audioProcessor.processAudio(testFile, {
        denoise: true,
        normalize: true,
        removeClipping: true,
        enhanceStereo: true
      });

      endTimes.push(Date.now());
    }

    // Check concurrent execution
    let maxConcurrent = 0;
    for (let i = 0; i < totalTasks; i++) {
      let concurrent = 1;
      for (let j = 0; j < totalTasks; j++) {
        if (i !== j && 
            startTimes[j] <= endTimes[i] && 
            endTimes[j] >= startTimes[i]) {
          concurrent++;
        }
      }
      maxConcurrent = Math.max(maxConcurrent, concurrent);
    }

    if (maxConcurrent > concurrentLimit) {
      throw new Error(`Concurrent processing limit exceeded: ${maxConcurrent} > ${concurrentLimit}`);
    }
  }

  private async createTestAudioFile(): Promise<File> {
    const sampleRate = 48000;
    const duration = 1;
    const buffer = new AudioBuffer({
      length: sampleRate * duration,
      numberOfChannels: 2,
      sampleRate
    });

    // Create test signal
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
    }

    // Convert to WAV
    const wav = await this.audioBufferToWav(buffer);
    return new File([wav], 'test.wav', { type: 'audio/wav' });
  }

  private async waitForProcessing(projectId: string): Promise<boolean> {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const status = await this.queueManager.getProgress(projectId);
      if (status.status === 'completed') {
        return true;
      }
      if (status.status === 'failed') {
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    return false;
  }

  private async audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
    // Simple WAV file creation
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset + (i * numChannels + channel) * 2, sample * 0x7FFF, true);
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
}