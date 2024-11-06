import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, Trash2, Music } from 'lucide-react';
import { KeySignature, Scale, Mode } from '@/types/music';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface KeySignatureEditorProps {
  keySignatures: KeySignature[];
  onChange: (keySignatures: KeySignature[]) => void;
}

export function KeySignatureEditor({
  keySignatures,
  onChange,
}: KeySignatureEditorProps) {
  const [newSignature, setNewSignature] = useState<Partial<KeySignature>>({
    rootNote: 'C',
    scale: 'major',
    mode: 'ionian',
    startTime: 0,
  });

  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const scales: Scale[] = [
    'major', 'natural_minor', 'harmonic_minor', 'melodic_minor',
    'pentatonic_major', 'pentatonic_minor', 'blues', 'chromatic',
    'whole_tone', 'diminished', 'bebop', 'diatonic'
  ];
  const modes: Mode[] = [
    'ionian', 'dorian', 'phrygian', 'lydian',
    'mixolydian', 'aeolian', 'locrian'
  ];

  const handleAdd = () => {
    if (!newSignature.rootNote || !newSignature.scale || !newSignature.mode || 
        newSignature.startTime === undefined) return;

    const updated = [...keySignatures, newSignature as KeySignature].sort(
      (a, b) => a.startTime - b.startTime
    );
    onChange(updated);
    setNewSignature({
      rootNote: 'C',
      scale: 'major',
      mode: 'ionian',
      startTime: 0,
    });
  };

  const handleRemove = (index: number) => {
    const updated = keySignatures.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Key Changes</h3>
          <Music className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          {keySignatures.map((sig, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 bg-gray-900/50 p-3 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-4 gap-4">
                <Select
                  value={sig.rootNote}
                  onValueChange={(value) => {
                    const updated = [...keySignatures];
                    updated[index] = { ...sig, rootNote: value };
                    onChange(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Root Note" />
                  </SelectTrigger>
                  <SelectContent>
                    {notes.map((note) => (
                      <SelectItem key={note} value={note}>{note}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sig.scale}
                  onValueChange={(value) => {
                    const updated = [...keySignatures];
                    updated[index] = { ...sig, scale: value as Scale };
                    onChange(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {scales.map((scale) => (
                      <SelectItem key={scale} value={scale}>
                        {scale.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sig.mode}
                  onValueChange={(value) => {
                    const updated = [...keySignatures];
                    updated[index] = { ...sig, mode: value as Mode };
                    onChange(updated);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  value={sig.startTime}
                  onChange={(e) => {
                    const updated = [...keySignatures];
                    updated[index] = {
                      ...sig,
                      startTime: parseFloat(e.target.value),
                    };
                    onChange(updated.sort((a, b) => a.startTime - b.startTime));
                  }}
                  step={0.1}
                  min={0}
                  placeholder="Start Time (s)"
                  className="bg-gray-800"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))}

          <div className="flex items-center space-x-4 border-2 border-dashed border-gray-700 p-3 rounded-lg">
            <div className="flex-1 grid grid-cols-4 gap-4">
              <Select
                value={newSignature.rootNote}
                onValueChange={(value) => 
                  setNewSignature({ ...newSignature, rootNote: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Root Note" />
                </SelectTrigger>
                <SelectContent>
                  {notes.map((note) => (
                    <SelectItem key={note} value={note}>{note}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newSignature.scale}
                onValueChange={(value) => 
                  setNewSignature({ ...newSignature, scale: value as Scale })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Scale" />
                </SelectTrigger>
                <SelectContent>
                  {scales.map((scale) => (
                    <SelectItem key={scale} value={scale}>
                      {scale.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newSignature.mode}
                onValueChange={(value) => 
                  setNewSignature({ ...newSignature, mode: value as Mode })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={newSignature.startTime}
                onChange={(e) =>
                  setNewSignature({
                    ...newSignature,
                    startTime: parseFloat(e.target.value),
                  })
                }
                step={0.1}
                min={0}
                placeholder="Start Time (s)"
                className="bg-gray-800"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 text-green-400" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}