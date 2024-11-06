'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { ProcessingOptions as Options } from '@/types/audio';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ProcessingOptionsProps {
  projectId: string;
  settings: Options;
}

export function ProcessingOptions({ projectId, settings }: ProcessingOptionsProps) {
  const [options, setOptions] = useState<Options>(settings);

  const updateOption = async <T extends keyof Options>(key: T, value: Options[T]) => {
    try {
      const newOptions = { ...options, [key]: value };
      setOptions(newOptions);

      await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOptions),
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">Processing Options</h3>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Audio Cleanup</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Noise Reduction</p>
                <p className="text-sm text-gray-400">Remove background noise</p>
              </div>
              <Switch
                checked={options.denoise}
                onCheckedChange={(checked) => updateOption('denoise', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Normalize Audio</p>
                <p className="text-sm text-gray-400">Balance audio levels</p>
              </div>
              <Switch
                checked={options.normalize}
                onCheckedChange={(checked) => updateOption('normalize', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Remove Clipping</p>
                <p className="text-sm text-gray-400">Fix audio distortion</p>
              </div>
              <Switch
                checked={options.removeClipping}
                onCheckedChange={(checked) => updateOption('removeClipping', checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Enhancement</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Enhance Stereo</p>
                <p className="text-sm text-gray-400">Improve stereo separation</p>
              </div>
              <Switch
                checked={options.enhanceStereo}
                onCheckedChange={(checked) => updateOption('enhanceStereo', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Pitch Correction</p>
                <p className="text-sm text-gray-400">Auto-tune vocals</p>
              </div>
              <Switch
                checked={options.pitchCorrection}
                onCheckedChange={(checked) => updateOption('pitchCorrection', checked)}
              />
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-white">Tempo Adjustment</p>
                <p className="text-sm text-gray-400">Adjust playback speed</p>
              </div>
              <Slider
                value={[options.tempoAdjustment]}
                onValueChange={([value]) => updateOption('tempoAdjustment', value)}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="text-right text-sm text-gray-400">
                {options.tempoAdjustment}x
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-white">Reverb Amount</p>
                <p className="text-sm text-gray-400">Add space and depth</p>
              </div>
              <Slider
                value={[options.reverbAmount]}
                onValueChange={([value]) => updateOption('reverbAmount', value)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-right text-sm text-gray-400">
                {options.reverbAmount}%
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">Equalization</h4>
          
          <div className="space-y-4">
            <Select
              value={options.eqPreset}
              onValueChange={(value) => updateOption('eqPreset', value as Options['eqPreset'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select EQ preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No EQ</SelectItem>
                <SelectItem value="voice">Voice Enhancement</SelectItem>
                <SelectItem value="music">Music Balance</SelectItem>
                <SelectItem value="bass">Bass Boost</SelectItem>
                <SelectItem value="custom">Custom EQ</SelectItem>
              </SelectContent>
            </Select>

            {options.eqPreset === 'custom' && (
              <div className="grid grid-cols-8 gap-2">
                {options.customEQ.map((band, index) => (
                  <div key={index} className="space-y-2">
                    <Slider
                      orientation="vertical"
                      value={[band]}
                      onValueChange={([value]) => {
                        const newEQ = [...options.customEQ];
                        newEQ[index] = value;
                        updateOption('customEQ', newEQ);
                      }}
                      min={-12}
                      max={12}
                      step={1}
                      className="h-32"
                    />
                    <div className="text-center text-xs text-gray-400">
                      {band > 0 ? '+' : ''}{band}dB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}