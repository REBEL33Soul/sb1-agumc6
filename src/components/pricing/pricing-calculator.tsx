'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PricingCalculator } from '@/lib/pricing/calculator';

export function PricingCalculator() {
  const [projectsPerMonth, setProjectsPerMonth] = useState(10);
  const [averageDuration, setAverageDuration] = useState(5);
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const calculator = PricingCalculator.getInstance();
  const recommendedTier = calculator.getRecommendedTier({
    projectsPerMonth,
    averageDuration,
    quality,
    features: selectedFeatures,
  });

  const estimatedCost = calculator.calculateProjectCost({
    duration: averageDuration,
    quality,
    features: selectedFeatures,
  }) * projectsPerMonth;

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700 mb-16">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Estimate Your Costs
          </h2>
          <p className="text-gray-400">
            Calculate your estimated monthly costs based on usage
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="text-sm text-white">Projects per Month</label>
            <Slider
              value={[projectsPerMonth]}
              onValueChange={([value]) => setProjectsPerMonth(value)}
              min={1}
              max={50}
              step={1}
            />
            <div className="text-right text-sm text-gray-400">
              {projectsPerMonth} projects
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm text-white">Average Duration (minutes)</label>
            <Slider
              value={[averageDuration]}
              onValueChange={([value]) => setAverageDuration(value)}
              min={1}
              max={30}
              step={1}
            />
            <div className="text-right text-sm text-gray-400">
              {averageDuration} minutes
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white">Quality Level</label>
            <Select value={quality} onValueChange={(value: any) => setQuality(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="ultra">Ultra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-lg text-white">Estimated Monthly Cost</p>
              <p className="text-3xl font-bold text-white">
                ${Math.ceil(estimatedCost)}
              </p>
            </div>
            <div>
              <p className="text-lg text-white">Recommended Plan</p>
              <p className="text-3xl font-bold text-blue-400">
                {recommendedTier}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}