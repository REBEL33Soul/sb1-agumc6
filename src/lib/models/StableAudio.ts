import { AudioGenerationParams } from '../../types/audio';
import { ModelConfig } from '../../types/platform';

export class StableAudio {
  private config: ModelConfig;
  private context: AudioContext;
  private processor: AudioWorkletNode | null = null;

  constructor(config: ModelConfig) {
    this.config = config;
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async initialize(): Promise<void> {
    await this.context.audioWorklet.addModule('/src/worklets/stable-audio-processor.js');
    this.processor = new AudioWorkletNode(this.context, 'stable-audio-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
  }

  async processAudio(inputBuffer: AudioBuffer, params: AudioGenerationParams): Promise<AudioBuffer> {
    if (!this.processor) {
      throw new Error('StableAudio not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        const duration = inputBuffer.duration;
        const outputBuffer = this.context.createBuffer(
          2,
          inputBuffer.length,
          this.context.sampleRate
        );

        this.processor!.port.postMessage({
          type: 'PROCESS',
          inputBuffer: inputBuffer,
          params: {
            ...params,
            useQuantization: this.config.quantization,
            useWebGL: this.config.useWebGL,
          },
        });

        this.processor!.port.onmessage = (event) => {
          if (event.data.type === 'PROCESSED') {
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