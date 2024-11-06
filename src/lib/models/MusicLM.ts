import { AudioGenerationParams } from '../../types/audio';
import { ModelConfig } from '../../types/platform';

export class MusicLM {
  private config: ModelConfig;
  private context: AudioContext;
  private processor: AudioWorkletNode | null = null;

  constructor(config: ModelConfig) {
    this.config = config;
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async initialize(): Promise<void> {
    await this.context.audioWorklet.addModule('/src/worklets/musiclm-processor.js');
    this.processor = new AudioWorkletNode(this.context, 'musiclm-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
  }

  async generateMusic(params: AudioGenerationParams): Promise<AudioBuffer> {
    if (!this.processor) {
      throw new Error('MusicLM not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        const duration = params.duration * this.context.sampleRate;
        const buffer = this.context.createBuffer(2, duration, this.context.sampleRate);
        
        // Process generation parameters
        this.processor!.port.postMessage({
          type: 'GENERATE',
          params: {
            ...params,
            sampleRate: this.context.sampleRate,
            batchSize: this.config.batchSize,
          },
        });

        this.processor!.port.onmessage = (event) => {
          if (event.data.type === 'GENERATED') {
            resolve(event.data.buffer);
          } else if (event.data.type === 'ERROR') {
            reject(new Error(event.data.message));
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  dispose(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.context.state !== 'closed') {
      this.context.close();
    }
  }
}