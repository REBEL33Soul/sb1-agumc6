import { HarmonySettings, Scale, Mode } from '@/types/music';
import { MusicTheory } from './music-theory';

export class HarmonyGenerator {
  private static instance: HarmonyGenerator;
  private musicTheory: MusicTheory;

  private constructor() {
    this.musicTheory = MusicTheory.getInstance();
  }

  static getInstance(): HarmonyGenerator {
    if (!HarmonyGenerator.instance) {
      HarmonyGenerator.instance = new HarmonyGenerator();
    }
    return HarmonyGenerator.instance;
  }

  generateHarmonies(
    melody: number[],
    settings: HarmonySettings
  ): number[][] {
    const harmonies: number[][] = [melody];
    const intervals = this.musicTheory.getScaleIntervals(settings.scale);
    
    for (let voice = 1; voice < settings.voiceCount; voice++) {
      const harmony = this.generateHarmonyLine(
        melody,
        intervals,
        settings.type,
        voice
      );
      harmonies.push(harmony);
    }

    return harmonies;
  }

  private generateHarmonyLine(
    melody: number[],
    intervals: number[],
    type: HarmonySettings['type'],
    voiceIndex: number
  ): number[] {
    switch (type) {
      case 'parallel':
        return this.generateParallelHarmony(melody, intervals, voiceIndex);
      case 'oblique':
        return this.generateObliqueHarmony(melody, intervals, voiceIndex);
      case 'contrary':
        return this.generateContraryHarmony(melody, intervals, voiceIndex);
      default:
        return melody;
    }
  }

  private generateParallelHarmony(
    melody: number[],
    intervals: number[],
    voiceIndex: number
  ): number[] {
    // Generate harmony moving in parallel motion
    return melody.map(note => {
      const interval = this.getHarmonyInterval(intervals, voiceIndex);
      return this.musicTheory.transposeFrequency(note, interval);
    });
  }

  private generateObliqueHarmony(
    melody: number[],
    intervals: number[],
    voiceIndex: number
  ): number[] {
    // Generate harmony with one voice staying static
    const harmony = [];
    let staticNote = melody[0];
    let useStatic = false;

    for (let i = 0; i < melody.length; i++) {
      if (i % 4 === 0) {
        useStatic = !useStatic;
        staticNote = melody[i];
      }

      if (useStatic) {
        harmony.push(staticNote);
      } else {
        const interval = this.getHarmonyInterval(intervals, voiceIndex);
        harmony.push(this.musicTheory.transposeFrequency(melody[i], interval));
      }
    }

    return harmony;
  }

  private generateContraryHarmony(
    melody: number[],
    intervals: number[],
    voiceIndex: number
  ): number[] {
    // Generate harmony moving in opposite direction
    const harmony = [];
    let direction = 1;

    for (let i = 0; i < melody.length; i++) {
      if (i > 0) {
        const melodicDirection = melody[i] > melody[i - 1] ? 1 : -1;
        direction = -melodicDirection;
      }

      const interval = this.getHarmonyInterval(intervals, voiceIndex) * direction;
      harmony.push(this.musicTheory.transposeFrequency(melody[i], interval));
    }

    return harmony;
  }

  private getHarmonyInterval(intervals: number[], voiceIndex: number): number {
    // Calculate harmony intervals based on voice index and scale
    const baseIntervals = [3, 5, 7]; // Thirds, fifths, sevenths
    const interval = baseIntervals[voiceIndex % baseIntervals.length];
    
    let scaleInterval = 0;
    for (let i = 0; i < interval; i++) {
      scaleInterval += intervals[i % intervals.length];
    }
    
    return scaleInterval;
  }
}