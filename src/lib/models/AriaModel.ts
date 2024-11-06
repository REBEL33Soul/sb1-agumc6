import { AudioGenerationParams } from '../../types/audio';
import { ModelConfig } from '../../types/platform';

export class AriaModel {
  private config: ModelConfig;
  private context: AudioContext;
  private processor: AudioWorkletNode | null = null;
  private wasmInstance: WebAssembly.Instance | null = null;

  constructor(config: ModelConfig) {
    this.config = config;
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async initialize(): Promise<void> {
    await this.initializeWasm();
    await this.context.audioWorklet.addModule('/src/worklets/aria-processor.js');
    
    this.processor = new AudioWorkletNode(this.context, 'aria-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
      processorOptions: {
        wasmMemory: this.wasmInstance?.exports.memory,
      },
    });
  }

  private async initializeWasm(): Promise<void> {
    if (this.config.useWasm) {
      const response = await fetch('/models/aria.wasm');
      const wasmModule = await WebAssembly.compile(await response.arrayBuffer());
      this.wasmInstance = await WebAssembly.instantiate(wasmModule, {
        env: {
          memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        },
      });
    }
  }

  async generateAudio(params: AudioGenerationParams): Promise<AudioBuffer> {
    if (!this.processor) {
      throw new Error('Aria not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        const duration = params.duration * this.context.sampleRate;
        const buffer = this.context.createBuffer(2, duration, this.context.sampleRate);

        this.processor!.port.postMessage({
          type: 'GENERATE',
          params: {
            ...params,
            sampleRate: this.context.sampleRate,
            useQuantization: this.config.quantization,
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
    this.wasmInstance = null;
  }
}