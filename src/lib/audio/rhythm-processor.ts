import { TimeSignature } from '@/types/music';

export class RhythmProcessor {
  private static instance: RhythmProcessor;

  private constructor() {}

  static getInstance(): RhythmProcessor {
    if (!RhythmProcessor.instance) {
      RhythmProcessor.instance = new RhythmProcessor();
    }
    return RhythmProcessor.instance;
  }

  getTimeSignatureAtTime(
    timeSignatures: TimeSignature[],
    time: number
  ): TimeSignature {
    // Find the active time signature for the given time
    const sorted = [...timeSignatures].sort((a, b) => b.startTime - a.startTime);
    return (
      sorted.find((sig) => sig.startTime <= time) || {
        numerator: 4,
        denominator: 4,
        startTime: 0,
      }
    );
  }

  getBeatDuration(timeSignature: TimeSignature, tempo: number): number {
    // Calculate beat duration in seconds
    const beatDuration = 60 / tempo; // Duration of quarter note
    return (beatDuration * 4) / timeSignature.denominator;
  }

  getBeatsInBar(timeSignature: TimeSignature): number {
    return timeSignature.numerator;
  }

  getBeatPosition(
    timeSignatures: TimeSignature[],
    time: number,
    tempo: number
  ): {
    bar: number;
    beat: number;
    subdivision: number;
  } {
    const currentSig = this.getTimeSignatureAtTime(timeSignatures, time);
    const beatDuration = this.getBeatDuration(currentSig, tempo);
    const beatsPerBar = this.getBeatsInBar(currentSig);

    // Calculate total beats since the start of this time signature
    const timeInSignature = time - currentSig.startTime;
    const totalBeats = timeInSignature / beatDuration;

    // Calculate bar and beat numbers
    const bar = Math.floor(totalBeats / beatsPerBar);
    const beat = Math.floor(totalBeats % beatsPerBar);
    const subdivision = (totalBeats % 1) * 4; // Sixteenth note subdivisions

    return { bar, beat, subdivision };
  }

  quantizeTime(
    time: number,
    timeSignatures: TimeSignature[],
    tempo: number,
    gridSize: 1 | 0.5 | 0.25 | 0.125 = 0.25 // Quarter, eighth, sixteenth, thirty-second notes
  ): number {
    const currentSig = this.getTimeSignatureAtTime(timeSignatures, time);
    const beatDuration = this.getBeatDuration(currentSig, tempo);
    const gridDuration = beatDuration * gridSize;

    // Quantize to nearest grid position
    return Math.round(time / gridDuration) * gridDuration;
  }

  generateMetronomeClick(
    timeSignature: TimeSignature,
    tempo: number,
    duration: number
  ): AudioBuffer {
    const context = new AudioContext();
    const sampleRate = context.sampleRate;
    const beatDuration = this.getBeatDuration(timeSignature, tempo);
    const beatsPerBar = this.getBeatsInBar(timeSignature);
    const buffer = context.createBuffer(
      1,
      Math.ceil(duration * sampleRate),
      sampleRate
    );
    const data = buffer.getChannelData(0);

    // Generate click sounds
    for (
      let time = 0;
      time < duration;
      time += beatDuration * beatsPerBar
    ) {
      for (let beat = 0; beat < beatsPerBar; beat++) {
        const isDownbeat = beat === 0;
        const clickTime = time + beat * beatDuration;
        const clickSample = Math.floor(clickTime * sampleRate);

        // Generate different sounds for downbeats and regular beats
        if (clickSample < data.length) {
          const frequency = isDownbeat ? 1000 : 800;
          const clickDuration = 0.02;
          
          for (
            let i = 0;
            i < clickDuration * sampleRate && clickSample + i < data.length;
            i++
          ) {
            data[clickSample + i] =
              Math.sin(2 * Math.PI * frequency * (i / sampleRate)) *
              Math.exp(-i / (0.005 * sampleRate));
          }
        }
      }
    }

    return buffer;
  }
}