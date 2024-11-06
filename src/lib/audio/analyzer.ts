import { AudioAnalysisResult } from '@/types/audio';

export class AudioAnalyzer {
  private context: AudioContext;
  private analyser: AnalyserNode;

  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
  }

  async analyze(audioData: ArrayBuffer): Promise<AudioAnalysisResult> {
    const audioBuffer = await this.context.decodeAudioData(audioData);
    const channelData = audioBuffer.getChannelData(0);
    
    // Frequency analysis
    const frequencyData = new Float32Array(this.analyser.frequencyBinCount);
    const tempBuffer = this.context.createBuffer(1, channelData.length, audioBuffer.sampleRate);
    tempBuffer.getChannelData(0).set(channelData);
    
    const source = this.context.createBufferSource();
    source.buffer = tempBuffer;
    source.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    
    source.start(0);
    this.analyser.getFloatFrequencyData(frequencyData);
    source.stop();

    // Calculate audio features
    const rms = this.calculateRMS(channelData);
    const peakAmplitude = this.calculatePeakAmplitude(channelData);
    const zeroCrossings = this.calculateZeroCrossings(channelData);
    const spectralCentroid = this.calculateSpectralCentroid(frequencyData);
    const tempo = this.estimateTempo(channelData, audioBuffer.sampleRate);

    return {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      rms,
      peakAmplitude,
      zeroCrossings,
      spectralCentroid,
      tempo,
      timestamp: Date.now()
    };
  }

  private calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  private calculatePeakAmplitude(data: Float32Array): number {
    let max = 0;
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > max) max = abs;
    }
    return max;
  }

  private calculateZeroCrossings(data: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i - 1] < 0 && data[i] >= 0) || 
          (data[i - 1] >= 0 && data[i] < 0)) {
        crossings++;
      }
    }
    return crossings;
  }

  private calculateSpectralCentroid(frequencyData: Float32Array): number {
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const amplitude = Math.pow(10, frequencyData[i] / 20);
      numerator += amplitude * i;
      denominator += amplitude;
    }
    
    return numerator / denominator;
  }

  private estimateTempo(data: Float32Array, sampleRate: number): number {
    const bufferSize = 2048;
    const correlations = new Float32Array(bufferSize);
    
    // Calculate autocorrelation
    for (let lag = 0; lag < bufferSize; lag++) {
      let sum = 0;
      for (let i = 0; i < bufferSize; i++) {
        if (i + lag < data.length) {
          sum += data[i] * data[i + lag];
        }
      }
      correlations[lag] = sum;
    }
    
    // Find peaks in correlation
    const peaks = [];
    for (let i = 1; i < correlations.length - 1; i++) {
      if (correlations[i] > correlations[i - 1] && 
          correlations[i] > correlations[i + 1]) {
        peaks.push(i);
      }
    }
    
    // Convert peak intervals to BPM
    const intervals = peaks.map(peak => (60 * sampleRate) / peak);
    const medianBPM = intervals.sort((a, b) => a - b)[Math.floor(intervals.length / 2)];
    
    return Math.round(medianBPM);
  }

  dispose() {
    this.context.close();
  }
}