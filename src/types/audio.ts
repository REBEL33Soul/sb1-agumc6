export interface AudioConfig {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  bitDepth: number;
  immersiveFormat?: ImmersiveFormat;
}

export interface ImmersiveFormat {
  type: 'dolby_atmos' | 'spatial_audio' | 'sony_360' | 'ambisonics' | 'binaural' | 'auro3d' | 'dts_x';
  channelLayout: string;
  speakerConfig?: string;
  binauralMode?: 'hrtf' | 'crossfeed';
  renderMode?: 'objects' | 'channels' | 'hybrid';
  headTracking?: boolean;
  objectBased?: boolean;
}

export interface ProcessingOptions {
  denoise: boolean;
  normalize: boolean;
  removeClipping: boolean;
  enhanceStereo: boolean;
  removeBackground: boolean;
  pitchCorrection: boolean;
  tempoAdjustment: number;
  reverbAmount: number;
  eqPreset: 'none' | 'voice' | 'music' | 'bass' | 'custom';
  customEQ: number[];
  immersive?: {
    enabled: boolean;
    format: ImmersiveFormat;
    objectBased: boolean;
    headTracking: boolean;
    binauralization: boolean;
    speakerVirtualization: boolean;
  };
}

export const EXPORT_FORMATS = [
  {
    id: 'dolby-atmos',
    name: 'Dolby Atmos (ADM BWF)',
    extension: 'wav',
    quality: 100,
    sampleRate: 48000,
    bitDepth: 24,
    channels: 16,
    immersive: {
      type: 'dolby_atmos',
      channelLayout: '9.1.6',
      renderMode: 'objects'
    }
  },
  {
    id: 'spatial-audio',
    name: 'Apple Spatial Audio',
    extension: 'wav',
    quality: 100,
    sampleRate: 48000,
    bitDepth: 24,
    channels: 12,
    immersive: {
      type: 'spatial_audio',
      channelLayout: '7.1.4',
      renderMode: 'hybrid'
    }
  },
  {
    id: 'sony-360',
    name: 'Sony 360 Reality Audio',
    extension: 'wav',
    quality: 100,
    sampleRate: 48000,
    bitDepth: 24,
    channels: 13,
    immersive: {
      type: 'sony_360',
      channelLayout: '7.1.4',
      renderMode: 'objects'
    }
  },
  {
    id: 'auro3d',
    name: 'Auro-3D 13.1',
    extension: 'wav',
    quality: 100,
    sampleRate: 96000,
    bitDepth: 24,
    channels: 14,
    immersive: {
      type: 'auro3d',
      channelLayout: '13.1',
      renderMode: 'channels'
    }
  },
  {
    id: 'dtsx',
    name: 'DTS:X Pro',
    extension: 'wav',
    quality: 100,
    sampleRate: 96000,
    bitDepth: 24,
    channels: 16,
    immersive: {
      type: 'dts_x',
      channelLayout: '9.1.6',
      renderMode: 'objects'
    }
  }
];