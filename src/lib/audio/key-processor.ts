import { KeySignature, Scale, Mode } from '@/types/music';
import { MusicTheory } from './music-theory';

export class KeyProcessor {
  private static instance: KeyProcessor;
  private musicTheory: MusicTheory;

  private constructor() {
    this.musicTheory = MusicTheory.getInstance();
  }

  static getInstance(): KeyProcessor {
    if (!KeyProcessor.instance) {
      KeyProcessor.instance = new KeyProcessor();
    }
    return KeyProcessor.instance;
  }

  getKeySignatureAtTime(
    keySignatures: KeySignature[],
    time: number
  ): KeySignature {
    const sorted = [...keySignatures].sort((a, b) => b.startTime - a.startTime);
    return (
      sorted.find((sig) => sig.startTime <= time) || {
        rootNote: 'C',
        scale: 'major',
        mode: 'ionian',
        startTime: 0,
      }
    );
  }

  async processKeyChange(
    audioData: ArrayBuffer,
    fromKey: KeySignature,
    toKey: KeySignature,
    transitionDuration: number = 0.5
  ): Promise<ArrayBuffer> {
    const context = new AudioContext();
    const buffer = await context.decodeAudioData(audioData);
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    
    const outputBuffer = context.createBuffer(
      channels,
      buffer.length,
      sampleRate
    );

    for (let channel = 0; channel < channels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);
      
      // Process each sample
      for (let i = 0; i < buffer.length; i++) {
        const time = i / sampleRate;
        const frequency = this.getFrequencyAtTime(inputData[i], time, fromKey, toKey);
        outputData[i] = frequency;
      }
    }

    return outputBuffer.getArrayBuffer();
  }

  private getFrequencyAtTime(
    sample: number,
    time: number,
    fromKey: KeySignature,
    toKey: KeySignature
  ): number {
    const fromFreq = this.musicTheory.getNoteFrequency(fromKey.rootNote, 4);
    const toFreq = this.musicTheory.getNoteFrequency(toKey.rootNote, 4);
    
    // Calculate pitch shift ratio
    const ratio = toFreq / fromFreq;
    
    // Apply gradual transition
    const transitionStart = toKey.startTime;
    const transitionEnd = transitionStart + 0.5; // 500ms transition
    
    if (time < transitionStart) {
      return sample;
    } else if (time > transitionEnd) {
      return sample * ratio;
    } else {
      // Smooth transition using cosine interpolation
      const t = (time - transitionStart) / (transitionEnd - transitionStart);
      const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
      return sample * (1 + (ratio - 1) * smoothT);
    }
  }

  getScaleNotesForKey(key: KeySignature): string[] {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const intervals = this.musicTheory.getScaleIntervals(key.scale);
    const modeIntervals = this.musicTheory.getModeIntervals(key.mode);
    
    const rootIndex = notes.indexOf(key.rootNote);
    const scaleNotes = [key.rootNote];
    let currentIndex = rootIndex;
    
    // Combine scale and mode intervals
    const combinedIntervals = this.combineIntervals(intervals, modeIntervals);
    
    // Build scale
    for (const interval of combinedIntervals) {
      currentIndex = (currentIndex + interval) % 12;
      scaleNotes.push(notes[currentIndex]);
    }
    
    return scaleNotes;
  }

  private combineIntervals(
    scaleIntervals: number[],
    modeIntervals: number[]
  ): number[] {
    // Rotate intervals based on mode
    const modeOffset = modeIntervals.reduce((sum, interval) => sum + interval, 0);
    const rotatedIntervals = [...scaleIntervals];
    
    for (let i = 0; i < modeOffset; i++) {
      rotatedIntervals.push(rotatedIntervals.shift()!);
    }
    
    return rotatedIntervals;
  }
}