import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, Trash2, Music } from 'lucide-react';
import { TimeSignature } from '@/types/music';
import { Input } from './ui/input';

interface TimeSignatureEditorProps {
  timeSignatures: TimeSignature[];
  onChange: (timeSignatures: TimeSignature[]) => void;
}

export function TimeSignatureEditor({
  timeSignatures,
  onChange,
}: TimeSignatureEditorProps) {
  const [newSignature, setNewSignature] = useState<Partial<TimeSignature>>({
    numerator: 4,
    denominator: 4,
    startTime: 0,
  });

  const handleAdd = () => {
    if (
      !newSignature.numerator ||
      !newSignature.denominator ||
      newSignature.startTime === undefined
    )
      return;

    const updated = [...timeSignatures, newSignature as TimeSignature].sort(
      (a, b) => a.startTime - b.startTime
    );
    onChange(updated);
    setNewSignature({ numerator: 4, denominator: 4, startTime: 0 });
  };

  const handleRemove = (index: number) => {
    const updated = timeSignatures.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Time Signatures</h3>
          <Music className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          {timeSignatures.map((sig, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 bg-gray-900/50 p-3 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  value={sig.numerator}
                  onChange={(e) => {
                    const updated = [...timeSignatures];
                    updated[index] = {
                      ...sig,
                      numerator: parseInt(e.target.value),
                    };
                    onChange(updated);
                  }}
                  min={1}
                  className="bg-gray-800"
                />
                <Input
                  type="number"
                  value={sig.denominator}
                  onChange={(e) => {
                    const updated = [...timeSignatures];
                    updated[index] = {
                      ...sig,
                      denominator: parseInt(e.target.value),
                    };
                    onChange(updated);
                  }}
                  min={1}
                  className="bg-gray-800"
                />
                <Input
                  type="number"
                  value={sig.startTime}
                  onChange={(e) => {
                    const updated = [...timeSignatures];
                    updated[index] = {
                      ...sig,
                      startTime: parseFloat(e.target.value),
                    };
                    onChange(updated.sort((a, b) => a.startTime - b.startTime));
                  }}
                  step={0.1}
                  min={0}
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
            <div className="flex-1 grid grid-cols-3 gap-4">
              <Input
                type="number"
                value={newSignature.numerator}
                onChange={(e) =>
                  setNewSignature({
                    ...newSignature,
                    numerator: parseInt(e.target.value),
                  })
                }
                min={1}
                placeholder="Beats"
                className="bg-gray-800"
              />
              <Input
                type="number"
                value={newSignature.denominator}
                onChange={(e) =>
                  setNewSignature({
                    ...newSignature,
                    denominator: parseInt(e.target.value),
                  })
                }
                min={1}
                placeholder="Beat Unit"
                className="bg-gray-800"
              />
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