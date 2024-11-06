import React, { useState } from 'react';
import { CustomButton } from '../ui/custom-button';
import { ActionButton } from '../ui/action-button';
import { ToggleButton } from '../ui/toggle-button';
import { 
  Music, 
  Play, 
  Pause, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Settings,
  Wand2,
  Save,
  Trash,
  Volume2,
  VolumeX
} from 'lucide-react';

export function ButtonExamples() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeFeature, setActiveFeature] = useState('enhance');

  return (
    <div className="space-y-12 p-6">
      {/* Custom Buttons Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Custom Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <CustomButton 
            variant="primary" 
            icon={<Play className="w-4 h-4" />}
          >
            Start Processing
          </CustomButton>

          <CustomButton 
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            Export Project
          </CustomButton>

          <CustomButton 
            variant="success"
            icon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </CustomButton>

          <CustomButton 
            variant="danger"
            icon={<Trash className="w-4 h-4" />}
          >
            Delete Project
          </CustomButton>

          <CustomButton 
            variant="ghost"
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </CustomButton>

          <CustomButton 
            variant="primary" 
            isLoading={true}
          >
            Processing
          </CustomButton>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Action Buttons</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ActionButton
            icon={<Wand2 className="w-5 h-5" />}
            label="AI Enhancement"
            description="Automatically enhance audio quality"
            active={activeFeature === 'enhance'}
            onClick={() => setActiveFeature('enhance')}
          />

          <ActionButton
            icon={<Music className="w-5 h-5" />}
            label="Stem Separation"
            description="Split audio into individual tracks"
            active={activeFeature === 'stems'}
            onClick={() => setActiveFeature('stems')}
          />

          <ActionButton
            icon={<Upload className="w-5 h-5" />}
            label="Batch Processing"
            description="Process multiple files at once"
            active={activeFeature === 'batch'}
            onClick={() => setActiveFeature('batch')}
          />
        </div>
      </div>

      {/* Toggle Buttons Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Toggle Buttons</h2>
        <div className="flex flex-wrap gap-8">
          <ToggleButton
            isActive={isPlaying}
            onToggle={() => setIsPlaying(!isPlaying)}
            activeIcon={<Pause className="w-4 h-4" />}
            inactiveIcon={<Play className="w-4 h-4" />}
            activeLabel="Playing"
            inactiveLabel="Paused"
            size="lg"
          />

          <ToggleButton
            isActive={isDarkMode}
            onToggle={() => setIsDarkMode(!isDarkMode)}
            activeIcon={<Moon className="w-4 h-4" />}
            inactiveIcon={<Sun className="w-4 h-4" />}
            activeLabel="Dark Mode"
            inactiveLabel="Light Mode"
            size="md"
          />

          <ToggleButton
            isActive={!isMuted}
            onToggle={() => setIsMuted(!isMuted)}
            activeIcon={<Volume2 className="w-4 h-4" />}
            inactiveIcon={<VolumeX className="w-4 h-4" />}
            activeLabel="Sound On"
            inactiveLabel="Muted"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}