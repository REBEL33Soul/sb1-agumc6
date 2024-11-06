import { AudioProcessor } from '../audio/processor';
import { AudioAnalyzer } from '../audio/analyzer';
import { ImmersiveProcessor } from '../audio/immersive-processor';

export class AudioProcessingTests {
  private processor: AudioProcessor;
  private analyzer: AudioAnalyzer;
  private immersiveProcessor: ImmersiveProcessor;

  constructor() {
    this.processor = AudioProcessor.getInstance();
    this.analyzer = new AudioAnalyzer();
    this.immersiveProcessor = ImmersiveProcessor.getInstance();
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
      this.testNoiseReduction.bind(this),
      this.testNormalization.bind(this),
      this.testImmersiveProcessing.bind(this),
      this.testRealTimeProcessing.bind(this),
      this.testMultiChannelProcessing.bind(this)
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

  private async testNoiseReduction() {
    // Create test audio buffer with known noise
    const sampleRate = 48000;
    const duration = 1; // 1 second
    const buffer = new AudioBuffer({
      length: sampleRate * duration,
      numberOfChannels: 2,
      sampleRate
    });

    // Add noise + signal
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) + // 440Hz tone
                (Math.random() * 0.1); // Noise
    }

    const processed = await this.processor.processAudio(buffer, {
      denoise: true,
      normalize: false,
      removeClipping: false,
      enhanceStereo: false
    });

    // Analyze results
    const originalNoise = this.calculateNoiseLevel(buffer);
    const processedNoise = this.calculateNoiseLevel(processed);

    if (processedNoise >= originalNoise) {
      throw new Error('Noise reduction failed');
    }
  }

  private async testNormalization() {
    const sampleRate = 48000;
    const buffer = new AudioBuffer({
      length: sampleRate,
      numberOfChannels: 2,
      sampleRate
    });

    // Create quiet signal
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
    }

    const processed = await this.processor.processAudio(buffer, {
      denoise: false,
      normalize: true,
      removeClipping: false,
      enhanceStereo: false
    });

    const originalPeak = this.calculatePeakAmplitude(buffer);
    const processedPeak = this.calculatePeakAmplitude(processed);

    if (processedPeak <= originalPeak) {
      throw new Error('Normalization failed');
    }
  }

  private async testImmersiveProcessing() {
    const sampleRate = 48000;
    const buffer = new AudioBuffer({
      length: sampleRate,
      numberOfChannels: 2,
      sampleRate
    });

    const processed = await this.immersiveProcessor.processImmersive(buffer, {
      immersive: {
        enabled: true,
        format: {
          type: 'dolby_atmos',
          channelLayout: '7.1.4',
          renderMode: 'objects'
        }
      }
    });

    if (processed.numberOfChannels !== 12) { // 7.1.4 = 12 channels
      throw new Error('Immersive processing failed');
    }
  }

  private async testRealTimeProcessing() {
    const chunkSize = 2048;
    const sampleRate = 48000;
    const latencies: number[] = [];

    for (let i = 0; i < 100; i++) {
      const buffer = new Float32Array(chunkSize);
      const start = performance.now();
      
      await this.processor.processAudio(buffer, {
        denoise: true,
        normalize: true,
        removeClipping: true,
        enhanceStereo: true
      });

      latencies.push(performance.now() - start);
    }

    const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
    if (avgLatency > 16.67) { // 60fps = 16.67ms per frame
      throw new Error('Real-time processing too slow');
    }
  }

  private async testMultiChannelProcessing() {
    const channels = [1, 2, 6, 8];
    for (const numChannels of channels) {
      const buffer = new AudioBuffer({
        length: 48000,
        numberOfChannels: numChannels,
        sampleRate: 48000
      });

      const processed = await this.processor.processAudio(buffer, {
        denoise: true,
        normalize: true,
        removeClipping: true,
        enhanceStereo: numChannels === 2
      });

      if (processed.numberOfChannels !== numChannels) {
        throw new Error(`Channel count mismatch: ${processed.numberOfChannels} !== ${numChannels}`);
      }
    }
  }

  private calculateNoiseLevel(buffer: AudioBuffer): number {
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += Math.abs(data[i]);
    }
    return sum / data.length;
  }

  private calculatePeakAmplitude(buffer: AudioBuffer): number {
    const data = buffer.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      peak = Math.max(peak, Math.abs(data[i]));
    }
    return peak;
  }
}