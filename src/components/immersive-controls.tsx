'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImmersiveFormat } from '@/types/audio';
import { Cube, Headphones, Speakers } from 'lucide-react';

interface ImmersiveControlsProps {
  projectId: string;
  enabled: boolean;
  format?: ImmersiveFormat;
  onUpdate: (settings: any) => void;
}

export function ImmersiveControls({
  projectId,
  enabled,
  format,
  onUpdate
}: ImmersiveControlsProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [currentFormat, setCurrentFormat] = useState<ImmersiveFormat | undefined>(format);

  const handleFormatChange = (type: ImmersiveFormat['type']) => {
    const newFormat: ImmersiveFormat = {
      type,
      channelLayout: type === 'dolby_atmos' ? '9.1.6' : 
                     type === 'spatial_audio' ? '7.1.4' : 'stereo',
      renderMode: type === 'binaural' ? undefined : 'objects',
      binauralMode: type === 'binaural' ? 'hrtf' : undefined
    };

    setCurrentFormat(newFormat);
    onUpdate({
      immersive: {
        enabled: isEnabled,
        format: newFormat,
        objectBased: newFormat.renderMode === 'objects',
        headTracking: type === 'spatial_audio',
        binauralization: type === 'binaural',
        speakerVirtualization: true
      }
    });
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Immersive Audio</h3>
            <p className="text-sm text-gray-400">Configure spatial audio settings</p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => {
              setIsEnabled(checked);
              onUpdate({ immersive: { enabled: checked, format: currentFormat } });
            }}
          />
        </div>

        {isEnabled && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Format</label>
              <Select
                value={currentFormat?.type}
                onValueChange={(value) => handleFormatChange(value as ImmersiveFormat['type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dolby_atmos">
                    <div className="flex items-center">
                      <Speakers className="w-4 h-4 mr-2" />
                      Dolby Atmos 9.1.6
                    </div>
                  </SelectItem>
                  <SelectItem value="spatial_audio">
                    <div className="flex items-center">
                      <Cube className="w-4 h-4 mr-2" />
                      Apple Spatial Audio
                    </div>
                  </SelectItem>
                  <SelectItem value="binaural">
                    <div className="flex items-center">
                      <Headphones className="w-4 h-4 mr-2" />
                      Binaural Audio
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentFormat?.type === 'binaural' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">HRTF Profile</label>
                <Select
                  value={currentFormat.binauralMode}
                  onValueChange={(value) => {
                    const newFormat = { ...currentFormat, binauralMode: value as 'hrtf' | 'crossfeed' };
                    setCurrentFormat(newFormat);
                    onUpdate({ immersive: { enabled: true, format: newFormat } });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select HRTF profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hrtf">Generic HRTF</SelectItem>
                    <SelectItem value="crossfeed">Crossfeed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(currentFormat?.type === 'dolby_atmos' || currentFormat?.type === 'spatial_audio') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Object-Based Audio</p>
                    <p className="text-sm text-gray-400">Enable dynamic object positioning</p>
                  </div>
                  <Switch
                    checked={currentFormat.renderMode === 'objects'}
                    onCheckedChange={(checked) => {
                      const newFormat = {
                        ...currentFormat,
                        renderMode: checked ? 'objects' : 'channels'
                      };
                      setCurrentFormat(newFormat);
                      onUpdate({ immersive: { enabled: true, format: newFormat } });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Head Tracking</p>
                    <p className="text-sm text-gray-400">Dynamic head movement response</p>
                  </div>
                  <Switch
                    checked={currentFormat.type === 'spatial_audio'}
                    disabled={currentFormat.type !== 'spatial_audio'}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}