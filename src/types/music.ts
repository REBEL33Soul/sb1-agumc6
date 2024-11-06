export type KeySignature = {
  rootNote: string;
  scale: Scale;
  mode: Mode;
  startTime: number; // In seconds
};

export interface MusicTheorySettings {
  tuning: 440 | 432;
  keySignatures: KeySignature[];
  timeSignatures: TimeSignature[];
  useFlats: boolean;
}

// ... rest of existing types