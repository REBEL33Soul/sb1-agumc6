import { AudioAnalyzer } from './analyzer';
import { ProcessingOptions } from '@/types/audio';

export class AudioProcessor {
  private static instance: AudioProcessor;
  private analyzer: AudioAnalyzer;
  private worker: Worker | null = null;
  private wasmInitialized = false;

  private constructor() {
    this.analyzer = new AudioAnalyzer();
    this.initializeWorker();
  }

  static getInstance(): AudioProcessor {
    if (!AudioProcessor.instance) {
      AudioProcessor.instance = new AudioProcessor();
    }
    return AudioProcessor.instance;
  }

  private async initializeWorker() {
    if (typeof Worker === 'undefined') return;

    this.worker = new Worker(
      new URL('../workers/audioProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Initialize WebAssembly in worker
    this.worker.postMessage({ type: 'init' });

    return new Promise<void>((resolve) => {
      if (!this.worker) {
        resolve();
        return;
      }

      this.worker.onmessage = (e) => {
        if (e.data.type === 'initialized') {
          this.wasmInitialized = true;
          resolve();
        }
      };
    });
  }

  async processAudio(
    audioData: ArrayBuffer,
    options: ProcessingOptions
  ): Promise<ArrayBuffer> {
    // Use WebAssembly if available
    if (this.wasmInitialized && this.worker) {
      return this.processWithWasm(audioData, options);
    }

    // Fallback to JavaScript processing
    return this.processWithJS(audioData, options);
  }

  private async processWithWasm(
    audioData: ArrayBuffer,
    options: ProcessingOptions
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      this.worker.onmessage = (e) => {
        if (e.data.type === 'processed') {
          resolve(e.data.data.buffer);
        } else if (e.data.type === 'error') {
          reject(new Error(e.data.error));
        }
      };

      this.worker.postMessage(
        {
          type: 'process',
          audioData: new Float32Array(audioData),
          options
        },
        [audioData]
      );
    });
  }

  private async processWithJS(
    audioData: ArrayBuffer,
    options: ProcessingOptions
  ): Promise<ArrayBuffer> {
    const audioCtx = new AudioContext();
    const buffer = await audioCtx.decodeAudioData(audioData);
    
    // Process each channel
    const processedChannels = [];
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      const processed = this.processChannel(channelData, options);
      processedChannels.push(processed);
    }

    // Create output buffer
    const outputBuffer = audioCtx.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    // Copy processed data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      outputBuffer.copyToChannel(processedChannels[i], i);
    }

    return this.encodeAudioData(outputBuffer);
  }

  private processChannel(data: Float32Array, options: ProcessingOptions): Float32Array {
    const output = new Float32Array(data.length);

    for (let i = 0; i < data.length; i++) {
      let sample = data[i];

      if (options.denoise) {
        sample = this.denoiseFrame(sample);
      }

      if (options.normalize) {
        sample = this.normalizeFrame(sample);
      }

      if (options.removeClipping) {
        sample = this.removeClipping(sample);
      }

      output[i] = sample;
    }

    return output;
  }

  private denoiseFrame(sample: number): number {
    // Simple noise gate
    const threshold = 0.01;
    return Math.abs(sample) < threshold ? 0 : sample;
  }

  private normalizeFrame(sample: number): number {
    // Simple normalization
    const maxGain = 0.9;
    return sample * maxGain;
  }

  private removeClipping(sample: number): number {
    // Soft clipping
    const threshold = 0.8;
    if (Math.abs(sample) > threshold) {
      return Math.sign(sample) * (threshold + Math.tanh(Math.abs(sample) - threshold));
    }
    return sample;
  }

  private async encodeAudioData(buffer: AudioBuffer): Promise<ArrayBuffer> {
    // Simple WAV encoding
    const length = buffer.length * buffer.numberOfChannels * 2;
    const output = new ArrayBuffer(44 + length);
    const view = new DataView(output);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);

    // Audio data
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset + (i * buffer.numberOfChannels + channel) * 2, sample * 0x7FFF, true);
      }
    }

    return output;
  }
}