import React from 'react';
import { Volume2, Music, Wand2 } from 'lucide-react';

interface MixingControlsProps {
  onProcessingChange: (isProcessing: boolean) => void;
}

export function MixingControls({ onProcessingChange }: MixingControlsProps) {
  const handleProcess = async () => {
    onProcessingChange(true);
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    onProcessingChange(false);
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-300 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Master Volume
          </label>
          <input
            type="range"
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300 flex items-center gap-2">
            <Music className="w-4 h-4" />
            Psychoacoustic Enhancement
          </label>
          <input
            type="range"
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={handleProcess}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Wand2 className="w-5 h-5" />
        Process Mix
      </button>
    </div>
  );
}