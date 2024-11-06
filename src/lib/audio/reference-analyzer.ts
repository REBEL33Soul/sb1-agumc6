import { AudioAnalyzer } from './analyzer';
import { AudioAnalysisResult } from '@/types/audio';

export class ReferenceAnalyzer {
  private static instance: ReferenceAnalyzer;
  private analyzer: AudioAnalyzer;

  private constructor() {
    this.analyzer = new AudioAnalyzer();
  }

  static getInstance(): ReferenceAnalyzer {
    if (!ReferenceAnalyzer.instance) {
      ReferenceAnalyzer.instance = new ReferenceAnalyzer();
    }
    return ReferenceAnalyzer.instance;
  }

  async analyzeReference(
    referenceData: ArrayBuffer,
    targetData: ArrayBuffer
  ): Promise<{
    reference: AudioAnalysisResult;
    target: AudioAnalysisResult;
    matchScore: number;
    recommendations: string[];
  }> {
    const referenceAnalysis = await this.analyzer.analyze(referenceData);
    const targetAnalysis = await this.analyzer.analyze(targetData);

    const matchScore = this.calculateMatchScore(referenceAnalysis, targetAnalysis);
    const recommendations = this.generateRecommendations(
      referenceAnalysis,
      targetAnalysis
    );

    return {
      reference: referenceAnalysis,
      target: targetAnalysis,
      matchScore,
      recommendations,
    };
  }

  private calculateMatchScore(
    reference: AudioAnalysisResult,
    target: AudioAnalysisResult
  ): number {
    const scores = {
      spectralBalance: this.compareSpectralBalance(reference, target),
      dynamics: this.compareDynamics(reference, target),
      stereoWidth: this.compareStereoWidth(reference, target),
      tempo: this.compareTempo(reference, target),
    };

    return Object.values(scores).reduce((sum, score) => sum + score, 0) / 
           Object.keys(scores).length;
  }

  private generateRecommendations(
    reference: AudioAnalysisResult,
    target: AudioAnalysisResult
  ): string[] {
    const recommendations: string[] = [];

    // Spectral balance recommendations
    if (Math.abs(reference.spectralCentroid - target.spectralCentroid) > 1000) {
      recommendations.push(
        target.spectralCentroid < reference.spectralCentroid
          ? 'Increase high frequencies to match reference brightness'
          : 'Reduce high frequencies to match reference warmth'
      );
    }

    // Dynamic range recommendations
    const refDynamicRange = reference.peakAmplitude / reference.rms;
    const targetDynamicRange = target.peakAmplitude / target.rms;
    if (Math.abs(refDynamicRange - targetDynamicRange) > 0.5) {
      recommendations.push(
        targetDynamicRange < refDynamicRange
          ? 'Increase dynamic range to match reference'
          : 'Compress dynamics to match reference'
      );
    }

    // Stereo width recommendations
    if (reference.spatialInfo && target.spatialInfo) {
      const refWidth = Math.abs(reference.spatialInfo.objectPositions[0].x);
      const targetWidth = Math.abs(target.spatialInfo.objectPositions[0].x);
      if (Math.abs(refWidth - targetWidth) > 0.2) {
        recommendations.push(
          targetWidth < refWidth
            ? 'Increase stereo width to match reference'
            : 'Reduce stereo width to match reference'
        );
      }
    }

    // Tempo recommendations
    if (Math.abs(reference.tempo - target.tempo) > 2) {
      recommendations.push(
        `Adjust tempo to match reference (${reference.tempo} BPM)`
      );
    }

    return recommendations;
  }

  private compareSpectralBalance(
    reference: AudioAnalysisResult,
    target: AudioAnalysisResult
  ): number {
    return 1 - Math.abs(
      reference.spectralCentroid - target.spectralCentroid
    ) / reference.spectralCentroid;
  }

  private compareDynamics(
    reference: AudioAnalysisResult,
    target: AudioAnalysisResult
  ): number {
    const refDynamicRange = reference.peakAmplitude / reference.rms;
    const targetDynamicRange = target.peakAmplitude / target.rms;
    return 1 - Math.abs(refDynamicRange - targetDynamicRange) / refDynamicRange;
  }

  private compareStereoWidth(
    reference: AudioAnalysisResult,
    target: AudioAnalysisResult
  ): number {
    if (!reference.spatialInfo || !target.spatialInfo) return 1;

    const refWidth = Math.abs(reference.spatialInfo.objectPositions[0].x);
    const targetWidth = Math.abs(target.spatialInfo.objectPositions[0].x);
    return 1 - Math.abs(refWidth - targetWidth);
  }

  private compareTempo(
    reference: AudioAnalysisResult,
    target: AudioAnalysisResult
  ): number {
    return 1 - Math.abs(reference.tempo - target.tempo) / reference.tempo;
  }
}