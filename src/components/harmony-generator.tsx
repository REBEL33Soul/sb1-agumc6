import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Music, Layers, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SingerType {
  style: string;
  gender: 'male' | 'female';
}

const SINGER_STYLES = [
  'Soul',
  'Rock',
  'Funk',
  'Classical',
  'Jazz',
  'Punk',
  'Country',
  'Gospel',
  'Choir',
  'Gang Vocal'
];

interface HarmonyGeneratorProps {
  projectId: string;
  onHarmoniesGenerated: (harmonies: string[]) => void;
}

export function HarmonyGenerator({ projectId, onHarmoniesGenerated }: HarmonyGeneratorProps) {
  const [harmonyType, setHarmonyType] = useState<'parallel' | 'oblique' | 'contrary'>('parallel');
  const [voiceCount, setVoiceCount] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [singers, setSingers] = useState<SingerType[]>([]);

  const handleAddSinger = () => {
    setSingers([...singers, { style: 'Soul', gender: 'male' }]);
  };

  const handleUpdateSinger = (index: number, updates: Partial<SingerType>) => {
    const updatedSingers = [...singers];
    updatedSingers[index] = { ...updatedSingers[index], ...updates };
    setSingers(updatedSingers);
  };

  const handleRemoveSinger = (index: number) => {
    setSingers(singers.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-harmonies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: harmonyType,
          voices: voiceCount,
          singers,
        }),
      });
      
      const data = await response.json();
      onHarmoniesGenerated(data.harmonies);
    } catch (error) {
      console.error('Harmony generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Harmony Generator</h3>
          <Layers className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Harmony Type</label>
            <Select
              value={harmonyType}
              onValueChange={(value: 'parallel' | 'oblique' | 'contrary') => 
                setHarmonyType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select harmony type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parallel">
                  Parallel - Lines move in same direction
                </SelectItem>
                <SelectItem value="oblique">
                  Oblique - One line stays while other moves
                </SelectItem>
                <SelectItem value="contrary">
                  Contrary - Lines move in opposite directions
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Number of Voices</label>
            <Select
              value={voiceCount.toString()}
              onValueChange={(value) => setVoiceCount(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voice count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Voices</SelectItem>
                <SelectItem value="3">3 Voices</SelectItem>
                <SelectItem value="4">4 Voices</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Harmony Singers</label>
              <Button
                onClick={handleAddSinger}
                variant="outline"
                size="sm"
              >
                Add Singer
              </Button>
            </div>

            <div className="space-y-4">
              {singers.map((singer, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                  <Select
                    value={singer.style}
                    onValueChange={(value) => handleUpdateSinger(index, { style: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {SINGER_STYLES.map((style) => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={singer.gender}
                    onValueChange={(value: 'male' | 'female') => 
                      handleUpdateSinger(index, { gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => handleRemoveSinger(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            <Music className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Harmonies'}
          </Button>
        </div>
      </div>
    </Card>
  );
}