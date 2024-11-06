import { Scale, Mode, MusicTheorySettings } from '@/types/music';
import { MusicTheory } from './music-theory';

export class ScaleTransformer {
  private static instance: ScaleTransformer;
  private musicTheory: MusicTheory;

  private constructor() {
    this.musicTheory = MusicTheory.getInstance();
  }

  static getInstance(): ScaleTransformer {
    if (!ScaleTransformer.instance) {
      ScaleTransformer.instance = new ScaleTransformer();
    }
    return ScaleTransformer.instance;
  }

  transformScale(
    frequencies: number[],
    fromSettings: MusicTheorySettings,
    toSettings: MusicTheorySettings
  ): number[] {
    // Transform frequencies from one scale/mode to another
    const fromIntervals = this.getIntervals(fromSettings.scale, fromSettings.mode);
    const toIntervals = this.getIntervals(toSettings.scale, toSettings.mode);

    return frequencies.map(freq => {
      const semitones = this.getSemitonesDiff(
        freq,
        fromSettings.rootNote,
        fromIntervals,
        toSettings.rootNote,
        toIntervals
      );
      return this.musicTheory.transposeFrequency(freq, semitones);
    });
  }

  private getIntervals(scale: Scale, mode: Mode): number[] {
    const scaleIntervals = this.musicTheory.getScaleIntervals(scale);
    const modeIntervals = this.musicTheory.getModeIntervals(mode);
    
    // Combine scale and mode intervals
    return this.rotateIntervals(scaleIntervals, modeIntervals);
  }

  private rotateIntervals(
    scaleIntervals: number[],
    modeIntervals: number[]
  ): number[] {
    const totalSteps = modeIntervals.reduce((sum, interval) => sum + interval, 0);
    const rotationSteps = Math.floor(totalSteps / 2);
    
    const rotated = [...scaleIntervals];
    for (let i = 0; i < rotationSteps; i++) {
      rotated.push(rotated.shift()!);
    }
    
    return rotated;
  }

  private getSemitonesDiff(
    frequency: number,
    fromRoot: string,
    fromIntervals: number[],
    toRoot: string,
    toIntervals: number[]
  ): number {
    const fromRootFreq = this.musicTheory.getNoteFrequency(fromRoot, 4);
    const toRootFreq = this.musicTheory.getNoteFrequency(toRoot, 4);
    
    const fromSemitones = Math.round(12 * Math.log2(frequency / fromRootFreq));
    const toSemitones = this.mapToNewScale(
      fromSemitones,
      fromIntervals,
      toIntervals
    );
    
    return toSemitones + Math.round(12 * Math.log2(toRootFreq / fromRootFreq));
  }

  private mapToNewScale(
    semitones: number,
    fromIntervals: number[],
    toIntervals: number[]
  ): number {
    let fromAccum = 0;
    let fromDegree = 0;
    
    // Find scale degree in original scale
    for (let i = 0; i < fromIntervals.length; i++) {
      if (Math.abs(semitones - fromAccum) <= fromIntervals[i] / 2) {
        fromDegree = i;
        break;
      }
      fromAccum += fromIntervals[i];
    }
    
    // Map to new scale
    let toAccum = 0;
    for (let i = 0; i < fromDegree; i++) {
      toAccum += toIntervals[i % toIntervals.length];
    }
    
    return toAccum;
  }
}