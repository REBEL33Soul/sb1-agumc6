import { describe, it, expect, beforeEach } from 'vitest';
import { AudioProcessor } from '../../lib/audio/processor';

describe('AudioProcessor', () => {
  let processor: AudioProcessor;
  let audioData: Float32Array;

  beforeEach(() => {
    processor = AudioProcessor.getInstance();
    const sampleRate = 48000;
    const duration = 1; // 1 second
    audioData = new Float32Array(sampleRate * duration);
    
    // Generate test signal
    for (let i = 0; i < audioData.length; i++) {
      audioData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
    }
  });

  it('should initialize successfully', async () => {
    await processor.initialize();
    expect(processor).toBeDefined();
  });

  it('should process audio without errors', async () => {
    const result = await processor.processAudio(audioData.buffer, {
      denoise: true,
      normalize: true,
      removeClipping: true,
      enhanceStereo: true
    });
    
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('should maintain audio duration after processing', async () => {
    const result = await processor.processAudio(audioData.buffer, {
      denoise: true,
      normalize: true
    });

    const resultArray = new Float32Array(result);
    expect(resultArray.length).toBe(audioData.length);
  });

  it('should handle immersive audio processing', async () => {
    const result = await processor.processAudio(audioData.buffer, {
      immersive: {
        enabled: true,
        format: {
          type: 'dolby_atmos',
          channelLayout: '7.1.4',
          renderMode: 'objects'
        }
      }
    });

    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });
});