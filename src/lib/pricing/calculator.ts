import { PRICING_TIERS } from './tiers';

interface CostFactors {
  processing: {
    cpuPerMinute: number;
    gpuPerMinute: number;
    storagePerGB: number;
    bandwidthPerGB: number;
  };
  ai: {
    inferencePerMinute: number;
    modelTrainingPerHour: number;
  };
  video: {
    renderingPerMinute: number;
    storagePerGB: number;
  };
}

export class PricingCalculator {
  private static instance: PricingCalculator;
  
  private readonly COST_FACTORS: CostFactors = {
    processing: {
      cpuPerMinute: 0.001,    // $0.001 per minute
      gpuPerMinute: 0.005,    // $0.005 per minute
      storagePerGB: 0.02,     // $0.02 per GB per month
      bandwidthPerGB: 0.08,   // $0.08 per GB
    },
    ai: {
      inferencePerMinute: 0.01,  // $0.01 per minute
      modelTrainingPerHour: 2.0,  // $2.00 per hour
    },
    video: {
      renderingPerMinute: 0.02,  // $0.02 per minute
      storagePerGB: 0.03,        // $0.03 per GB per month
    }
  };

  private readonly TARGET_MARGIN = 0.40; // 40% profit margin

  private constructor() {}

  static getInstance(): PricingCalculator {
    if (!PricingCalculator.instance) {
      PricingCalculator.instance = new PricingCalculator();
    }
    return PricingCalculator.instance;
  }

  calculateProjectCost(params: {
    duration: number;
    quality: 'standard' | 'high' | 'ultra';
    features: string[];
  }): number {
    const { duration, quality, features } = params;
    
    // Base processing costs
    let cost = duration * (
      this.COST_FACTORS.processing.cpuPerMinute +
      (quality === 'ultra' ? this.COST_FACTORS.processing.gpuPerMinute : 0)
    );

    // AI processing costs
    if (features.includes('ai_restoration')) {
      cost += duration * this.COST_FACTORS.ai.inferencePerMinute;
    }

    // Video rendering costs
    if (features.includes('video_generation')) {
      const videoQualityMultiplier = {
        standard: 1,
        high: 2,
        ultra: 4
      }[quality];
      
      cost += duration * this.COST_FACTORS.video.renderingPerMinute * 
              videoQualityMultiplier;
    }

    // Add overhead margin
    return cost / (1 - this.TARGET_MARGIN);
  }

  calculateStorageCost(sizeGB: number): number {
    return sizeGB * this.COST_FACTORS.processing.storagePerGB;
  }

  calculateBandwidthCost(sizeGB: number): number {
    return sizeGB * this.COST_FACTORS.processing.bandwidthPerGB;
  }

  getRecommendedTier(usage: {
    projectsPerMonth: number;
    averageDuration: number;
    quality: 'standard' | 'high' | 'ultra';
    features: string[];
  }): string {
    const monthlyCost = this.calculateProjectCost({
      duration: usage.averageDuration,
      quality: usage.quality,
      features: usage.features
    }) * usage.projectsPerMonth;

    // Find most cost-effective tier
    if (monthlyCost <= 15) return 'BASIC';
    if (monthlyCost <= 35) return 'PRO';
    return 'ENTERPRISE';
  }
}