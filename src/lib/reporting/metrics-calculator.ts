import { UsageMetrics, FinancialMetrics } from './types';

export class MetricsCalculator {
  private static instance: MetricsCalculator;
  
  private readonly COSTS = {
    processingPerMinute: 0.02,
    storagePerGBPerMonth: 0.05,
    bandwidthPerGB: 0.08,
    overheadPercentage: 0.15
  };

  private readonly TAX_RATES = {
    salesTax: 0.08,
    vatTax: 0.20
  };

  private constructor() {}

  static getInstance(): MetricsCalculator {
    if (!MetricsCalculator.instance) {
      MetricsCalculator.instance = new MetricsCalculator();
    }
    return MetricsCalculator.instance;
  }

  calculateProjectCosts(metrics: UsageMetrics): FinancialMetrics {
    // Calculate base costs
    const processingCost = (metrics.processingTime / 60) * this.COSTS.processingPerMinute;
    const storageCost = (metrics.storageUsed / 1024 / 1024 / 1024) * this.COSTS.storagePerGBPerMonth;
    const bandwidthCost = ((metrics.inputFileSize + metrics.outputFileSize) / 1024 / 1024 / 1024) * 
                         this.COSTS.bandwidthPerGB;

    // Calculate total costs
    const totalCosts = processingCost + storageCost + bandwidthCost;
    const overhead = totalCosts * this.COSTS.overheadPercentage;

    // Calculate revenue (based on subscription type)
    const revenue = this.calculateRevenue(metrics);

    // Calculate taxes
    const salesTax = revenue * this.TAX_RATES.salesTax;
    const vatTax = revenue * this.TAX_RATES.vatTax;

    // Calculate profit
    const totalTaxes = salesTax + vatTax;
    const totalCostsWithOverhead = totalCosts + overhead;
    const profit = revenue - totalCostsWithOverhead - totalTaxes;

    return {
      revenue,
      costs: {
        processing: processingCost,
        storage: storageCost,
        bandwidth: bandwidthCost,
        overhead
      },
      taxes: {
        salesTax,
        vatTax
      },
      profit
    };
  }

  private calculateRevenue(metrics: UsageMetrics): number {
    // Base price per project
    const basePrices = {
      restoration: 5,
      mastering: 3,
      generation: 4
    };

    // Feature multipliers
    const featureMultipliers: { [key: string]: number } = {
      'immersive_audio': 1.5,
      'stem_separation': 1.3,
      'video_generation': 2.0
    };

    // Calculate total multiplier
    const multiplier = metrics.features.reduce((acc, feature) => {
      return acc * (featureMultipliers[feature] || 1);
    }, 1);

    return basePrices[metrics.appType] * multiplier;
  }

  calculateMargins(metrics: FinancialMetrics): {
    grossMargin: number;
    netMargin: number;
    operatingMargin: number;
  } {
    const totalCosts = Object.values(metrics.costs).reduce((a, b) => a + b, 0);
    const totalTaxes = Object.values(metrics.taxes).reduce((a, b) => a + b, 0);

    return {
      grossMargin: (metrics.revenue - totalCosts) / metrics.revenue * 100,
      netMargin: metrics.profit / metrics.revenue * 100,
      operatingMargin: (metrics.revenue - totalCosts - metrics.costs.overhead) / 
                      metrics.revenue * 100
    };
  }
}