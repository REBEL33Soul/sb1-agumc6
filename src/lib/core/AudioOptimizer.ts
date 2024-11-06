import { AudioEngine } from './AudioEngine';
import { WebGPUAccelerator } from '../audio/webgpu-accelerator';
import { WorkerPool } from './WorkerPool';

export class AudioOptimizer {
  private static instance: AudioOptimizer;
  private audioEngine: AudioEngine;
  private gpuAccelerator: WebGPUAccelerator;
  private workerPool: WorkerPool;
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks

  private constructor() {
    this.audioEngine = AudioEngine.getInstance();
    this.gpuAccelerator = new WebGPUAccelerator();
    this.workerPool = new WorkerPool(4); // 4 workers
    this.initialize();
  }

  static getInstance(): AudioOptimizer {
    if (!AudioOptimizer.instance) {
      AudioOptimizer.instance = new AudioOptimizer();
    }
    return AudioOptimizer.instance;
  }

  private async initialize() {
    await this.gpuAccelerator.initialize();
    await this.setupWorkers();
  }

  private async setupWorkers() {
    await this.workerPool.initialize('/workers/audio-processor.js');
  }

  async processAudioChunk(chunk: ArrayBuffer): Promise<ArrayBuffer> {
    if (this.gpuAccelerator.isAvailable()) {
      return this.processWithGPU(chunk);
    }
    return this.processWithWorkers(chunk);
  }

  private async processWithGPU(chunk: ArrayBuffer): Promise<ArrayBuffer> {
    // Use WebGPU for parallel processing
    return this.gpuAccelerator.processAudio(chunk);
  }

  private async processWithWorkers(chunk: ArrayBuffer): Promise<ArrayBuffer> {
    // Split processing across workers
    const chunks = this.splitIntoChunks(chunk);
    const promises = chunks.map(c => 
      this.workerPool.processTask('processAudio', { chunk: c })
    );
    
    const results = await Promise.all(promises);
    return this.mergeChunks(results);
  }

  private splitIntoChunks(buffer: ArrayBuffer): ArrayBuffer[] {
    const chunks: ArrayBuffer[] = [];
    let offset = 0;
    
    while (offset < buffer.byteLength) {
      const size = Math.min(this.CHUNK_SIZE, buffer.byteLength - offset);
      chunks.push(buffer.slice(offset, offset + size));
      offset += size;
    }
    
    return chunks;
  }

  private mergeChunks(chunks: ArrayBuffer[]): ArrayBuffer {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const result = new ArrayBuffer(totalLength);
    const view = new Uint8Array(result);
    
    let offset = 0;
    for (const chunk of chunks) {
      view.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    
    return result;
  }
}