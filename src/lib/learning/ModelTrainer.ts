import { AudioAnalysisResult, ProcessingOptions, ImmersiveFormat } from '@/types/audio';
import { db } from '@/lib/db';
import { StorageManager } from '../storage/StorageManager';

interface TrainingData {
  inputFeatures: AudioAnalysisResult;
  processingOptions: ProcessingOptions;
  outputFeatures: AudioAnalysisResult;
  qualityScore: number;
  metadata: {
    format?: string;
    immersiveType?: string;
    referenceTrack?: boolean;
    restoration?: {
      artifactTypes: string[];
      damagePatterns: string[];
    };
    spatialInfo?: {
      objectPositions: Array<{ x: number; y: number; z: number }>;
      roomSize: { width: number; height: number; depth: number };
      reflections: number[];
    };
  };
}

export class ModelTrainer {
  private static instance: ModelTrainer;
  private storage: StorageManager;
  private isTraining = false;
  private trainingQueue: TrainingData[] = [];
  private readonly QUALITY_THRESHOLD = 0.8;
  private readonly BATCH_SIZE = 10;
  private readonly TRAINING_INTERVAL = 60000; // 1 minute

  private constructor() {
    this.storage = StorageManager.getInstance();
    this.startTrainingLoop();
    this.setupAutoScaling();
  }

  static getInstance(): ModelTrainer {
    if (!ModelTrainer.instance) {
      ModelTrainer.instance = new ModelTrainer();
    }
    return ModelTrainer.instance;
  }

  private setupAutoScaling() {
    setInterval(() => {
      const queueSize = this.trainingQueue.length;
      if (queueSize > this.BATCH_SIZE * 2) {
        this.BATCH_SIZE = Math.min(20, this.BATCH_SIZE + 2);
      } else if (queueSize < this.BATCH_SIZE / 2) {
        this.BATCH_SIZE = Math.max(5, this.BATCH_SIZE - 1);
      }
    }, this.TRAINING_INTERVAL * 5);
  }

  async addTrainingData(data: TrainingData) {
    const enhancedData = await this.enrichTrainingData(data);
    
    await db.trainingData.create({
      data: {
        inputFeatures: enhancedData.inputFeatures,
        processingOptions: enhancedData.processingOptions,
        outputFeatures: enhancedData.outputFeatures,
        qualityScore: enhancedData.qualityScore,
        metadata: enhancedData.metadata,
        timestamp: new Date(),
      },
    });

    this.trainingQueue.push(enhancedData);
    await this.checkAndTriggerTraining();
  }

  private async enrichTrainingData(data: TrainingData): Promise<TrainingData> {
    // Enhance spatial audio information
    if (data.processingOptions.immersive?.enabled) {
      data.metadata.spatialInfo = await this.analyzeSpatialCharacteristics(
        data.inputFeatures,
        data.processingOptions.immersive.format
      );
    }

    // Analyze reference track patterns if available
    if (data.metadata.referenceTrack) {
      data.metadata.restoration = {
        ...data.metadata.restoration,
        ...await this.analyzeReferencePatterns(data.inputFeatures, data.outputFeatures)
      };
    }

    return data;
  }

  private async analyzeSpatialCharacteristics(
    features: AudioAnalysisResult,
    format: ImmersiveFormat
  ) {
    const channelCount = format.type === 'dolby_atmos' ? 16 : 
                        format.type === 'spatial_audio' ? 12 : 2;

    return {
      objectPositions: this.calculateObjectPositions(features, channelCount),
      roomSize: this.estimateRoomSize(features),
      reflections: this.analyzeReflections(features)
    };
  }

  private calculateObjectPositions(features: AudioAnalysisResult, channels: number) {
    const positions = [];
    const angleStep = (2 * Math.PI) / channels;

    for (let i = 0; i < channels; i++) {
      const angle = i * angleStep;
      positions.push({
        x: Math.cos(angle) * features.rms,
        y: Math.sin(angle) * features.rms,
        z: features.spectralCentroid / features.sampleRate
      });
    }

    return positions;
  }

  private estimateRoomSize(features: AudioAnalysisResult) {
    return {
      width: Math.max(3, features.rms * 10),
      height: Math.max(2.4, features.spectralCentroid / 1000),
      depth: Math.max(3, features.peakAmplitude * 10)
    };
  }

  private analyzeReflections(features: AudioAnalysisResult) {
    const reflections = [];
    const sampleCount = 8;
    
    for (let i = 0; i < sampleCount; i++) {
      const reflection = features.rms * Math.exp(-i * 0.5);
      reflections.push(Math.max(0, Math.min(1, reflection)));
    }

    return reflections;
  }

  private async analyzeReferencePatterns(
    input: AudioAnalysisResult,
    reference: AudioAnalysisResult
  ) {
    return {
      artifactTypes: this.detectArtifactTypes(input, reference),
      damagePatterns: this.detectDamagePatterns(input, reference),
      spectralBalance: this.analyzeSpectralBalance(input, reference),
      dynamicRange: this.analyzeDynamicRange(input, reference)
    };
  }

  private detectArtifactTypes(input: AudioAnalysisResult, reference: AudioAnalysisResult) {
    const artifacts = [];
    
    if (input.peakAmplitude > reference.peakAmplitude * 1.2) artifacts.push('clipping');
    if (input.rms < reference.rms * 0.5) artifacts.push('noise');
    if (input.spectralCentroid < reference.spectralCentroid * 0.7) artifacts.push('muffled');
    if (input.zeroCrossings > reference.zeroCrossings * 1.5) artifacts.push('distortion');

    return artifacts;
  }

  private detectDamagePatterns(input: AudioAnalysisResult, reference: AudioAnalysisResult) {
    const patterns = [];
    
    if (input.tempo < reference.tempo * 0.95) patterns.push('wow');
    if (input.tempo > reference.tempo * 1.05) patterns.push('flutter');
    if (input.rms < reference.rms * 0.3) patterns.push('dropout');
    if (Math.abs(input.spectralCentroid - reference.spectralCentroid) > 1000) {
      patterns.push('azimuth_error');
    }

    return patterns;
  }

  private analyzeSpectralBalance(input: AudioAnalysisResult, reference: AudioAnalysisResult) {
    return {
      lowEnd: input.spectralCentroid / reference.spectralCentroid,
      presence: input.zeroCrossings / reference.zeroCrossings,
      brightness: input.rms / reference.rms
    };
  }

  private analyzeDynamicRange(input: AudioAnalysisResult, reference: AudioAnalysisResult) {
    return {
      inputRange: input.peakAmplitude / input.rms,
      referenceRange: reference.peakAmplitude / reference.rms,
      compressionRatio: (reference.peakAmplitude / reference.rms) / 
                       (input.peakAmplitude / input.rms)
    };
  }

  // ... rest of the existing ModelTrainer code ...
}