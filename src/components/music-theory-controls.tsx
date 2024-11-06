// Update the MusicTheoryControls component to include TimeSignatureEditor
import React from 'react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { MusicTheorySettings, Scale, Mode } from '@/types/music';
import { Music, Settings2 } from 'lucide-react';
import { TimeSignatureEditor } from './time-signature-editor';

interface MusicTheoryControlsProps {
  settings: MusicTheorySettings;
  onUpdate: (settings: Partial<MusicTheorySettings>) => void;
}

export function MusicTheoryControls({ settings, onUpdate }: MusicTheoryControlsProps) {
  // ... existing code ...

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
        {/* ... existing controls ... */}
      </Card>

      <TimeSignatureEditor
        timeSignatures={settings.timeSignatures}
        onChange={(timeSignatures) => onUpdate({ timeSignatures })}
      />
    </div>
  );
}