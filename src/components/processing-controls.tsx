import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProcessingOptions } from '@/types/audio';

interface ProcessingControlsProps {
  projectId: string;
  onUpdate: (options: Partial<ProcessingOptions>) => void;
  initialOptions?: ProcessingOptions;
}

export function ProcessingControls({
  projectId,
  onUpdate,
  initialOptions
}: ProcessingControlsProps) {
  const [options, setOptions] = useState<ProcessingOptions>(initialOptions || {
    denoise: true,
    normalize: true,
    removeClipping: true,
    enhanceStereo: false,
    pitchCorrection: false,
    tempoAdjustment: 1,
    reverbAmount: 0,
    eqPreset: 'none',
    customEQ: Array(8).fill(0),
  });

  const handleUpdate = (updates: Partial<ProcessingOptions>) => {
    setOptions(prev => {
      const newOptions = { ...prev, ...updates };
      onUpdate(newOptions);
      return newOptions;
    });
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Processing Options</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Noise Reduction</p>
              <p className="text-sm text-gray-400">Remove background noise</p>
            </div>
            <Switch
              checked={options.denoise}
              onCheckedChange={checked => handleUpdate({ denoise: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Normalize Audio</p>
              <p className="text-sm text-gray-400">Balance audio levels</p>
            </div>
            <Switch
              checked={options.normalize}
              onCheckedChange={checked => handleUpdate({ normalize: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Remove Clipping</p>
              <p className="text-sm text-gray-400">Fix audio distortion</p>
            </div>
            <Switch
              checked={options.removeClipping}
              onCheckedChange={checked => handleUpdate({ removeClipping: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Enhance Stereo</p>
              <p className="text-sm text-gray-400">Improve stereo separation</p>
            </div>
            <Switch
              checked={options.enhanceStereo}
              onCheckedChange={checked => handleUpdate({ enhanceStereo: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Pitch Correction</p>
              <p className="text-sm text-gray-400">Auto-tune vocals</p>
            </div>
            <Switch
              checked={options.pitchCorrection}
              onCheckedChange={checked => handleUpdate({ pitchCorrection: checked })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white">Tempo Adjustment</label>
            <Slider
              value={[options.tempoAdjustment * 100]}
              onValueChange={([value]) => 
                handleUpdate({ tempoAdjustment: value / 100 })
              }
              min={50}
              max={200}
              step={1}
            />
            <div className="text-right text-sm text-gray-400">
              {options.tempoAdjustment.toFixed(2)}x
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white">Reverb Amount</label>
            <Slider
              value={[options.reverbAmount]}
              onValueChange={([value]) => handleUpdate({ reverbAmount: value })}
              min={0}
              max={100}
              step={1}
            />
            <div className="text-right text-sm text-gray-400">
              {options.reverbAmount}%
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white">EQ Preset</label>
            <Select
              value={options.eqPreset}
              onValueChange={value => 
                handleUpdate({ eqPreset: value as ProcessingOptions['eqPreset'] })
              }
            >
              <SelectTrigger>
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
          </div>

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
                      handleUpdate({ customEQ: newEQ });
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
    </Card>
  );
}