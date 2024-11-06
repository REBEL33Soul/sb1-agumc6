import { bench, describe } from 'vitest';
import { AudioProcessor } from '../../lib/audio/processor';

describe('Audio Processing Performance', () => {
  const processor = AudioProcessor.getInstance();
  const sampleRate = 48000;
  const duration = 5; // 5 seconds
  const audioData = new Float32Array(sampleRate * duration);

  // Generate test audio data
  for (let i = 0; i < audioData.length; i++) {
    audioData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
  }

  bench('Noise Reduction', async () => {
    await processor.processAudio(audioData.buffer, {
      denoise: true,
      normalize: false,
      removeClipping: false,
      enhanceStereo: false
    });
  });

  bench('Full Processing Chain', async () => {
    await processor.processAudio(audioData.buffer, {
      denoise: true,
      normalize: true,
      removeClipping: true,
      enhanceStereo: true
    });
  });

  bench('Immersive Audio Processing', async () => {
    await processor.processAudio(audioData.buffer, {
      denoise: true,
      normalize: true,
      removeClipping: true,
      enhanceStereo: true,
      immersive: {
        enabled: true,
        format: {
          type: 'dolby_atmos',
          channelLayout: '7.1.4',
          renderMode: 'objects'
        }
      }
    });
  });
});