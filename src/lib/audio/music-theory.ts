import { Scale, Mode, Tuning } from '@/types/music';

export class MusicTheory {
  private static instance: MusicTheory;
  private baseFrequency: number;

  private constructor() {
    this.baseFrequency = 440; // Default A4 = 440Hz
  }

  static getInstance(): MusicTheory {
    if (!MusicTheory.instance) {
      MusicTheory.instance = new MusicTheory();
    }
    return MusicTheory.instance;
  }

  setBaseTuning(frequency: 440 | 432) {
    this.baseFrequency = frequency;
  }

  getScaleIntervals(scale: Scale): number[] {
    const intervals: { [key in Scale]: number[] } = {
      'major': [2, 2, 1, 2, 2, 2, 1],
      'natural_minor': [2, 1, 2, 2, 1, 2, 2],
      'harmonic_minor': [2, 1, 2, 2, 1, 3, 1],
      'melodic_minor': [2, 1, 2, 2, 2, 2, 1],
      'pentatonic_major': [2, 2, 3, 2, 3],
      'pentatonic_minor': [3, 2, 2, 3, 2],
      'blues': [3, 2, 1, 1, 3, 2],
      'chromatic': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      'whole_tone': [2, 2, 2, 2, 2, 2],
      'diminished': [2, 1, 2, 1, 2, 1, 2, 1],
      'bebop': [2, 2, 1, 2, 2, 1, 1, 1],
      'diatonic': [2, 2, 1, 2, 2, 2, 1]
    };
    return intervals[scale] || intervals.major;
  }

  getModeIntervals(mode: Mode): number[] {
    const modes: { [key in Mode]: number[] } = {
      'ionian': [2, 2, 1, 2, 2, 2, 1],
      'dorian': [2, 1, 2, 2, 2, 1, 2],
      'phrygian': [1, 2, 2, 2, 1, 2, 2],
      'lydian': [2, 2, 2, 1, 2, 2, 1],
      'mixolydian': [2, 2, 1, 2, 2, 1, 2],
      'aeolian': [2, 1, 2, 2, 1, 2, 2],
      'locrian': [1, 2, 2, 1, 2, 2, 2]
    };
    return modes[mode] || modes.ionian;
  }

  transposeFrequency(frequency: number, semitones: number): number {
    return frequency * Math.pow(2, semitones / 12);
  }

  getFrequencyRatio(fromFreq: number, toFreq: number): number {
    return toFreq / fromFreq;
  }

  getNoteFrequency(note: string, octave: number): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4_OCTAVE = 4;
    const A4_INDEX = notes.indexOf('A');
    
    const noteIndex = notes.indexOf(note.toUpperCase());
    const semitonesDiff = noteIndex - A4_INDEX + (octave - A4_OCTAVE) * 12;
    
    return this.baseFrequency * Math.pow(2, semitonesDiff / 12);
  }

  adjustPitchToScale(frequency: number, scale: Scale, rootNote: string): number {
    const intervals = this.getScaleIntervals(scale);
    const rootFreq = this.getNoteFrequency(rootNote, 4);
    
    // Find closest scale degree
    const semitonesDiff = 12 * Math.log2(frequency / rootFreq);
    let accumulatedInterval = 0;
    let adjustedSemitones = 0;
    
    for (const interval of intervals) {
      if (Math.abs(semitonesDiff - accumulatedInterval) <= interval / 2) {
        adjustedSemitones = accumulatedInterval;
        break;
      }
      accumulatedInterval += interval;
    }
    
    return rootFreq * Math.pow(2, adjustedSemitones / 12);
  }
}