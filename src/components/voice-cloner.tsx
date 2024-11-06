import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Mic2, Wand2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface VoiceClonerProps {
  projectId: string;
  onCloneComplete: (voiceId: string) => void;
}

export function VoiceCloner({ projectId, onCloneComplete }: VoiceClonerProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setVoiceFile(e.target.files[0]);
    }
  };

  const handleTrain = async () => {
    if (!voiceFile) return;

    setIsTraining(true);
    const formData = new FormData();
    formData.append('voice', voiceFile);

    try {
      const response = await fetch(`/api/projects/${projectId}/clone-voice`, {
        method: 'POST',
        body: formData,
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const data = JSON.parse(new TextDecoder().decode(value));
        setProgress(data.progress);

        if (data.voiceId) {
          onCloneComplete(data.voiceId);
          break;
        }
      }
    } catch (error) {
      console.error('Voice cloning failed:', error);
    } finally {
      setIsTraining(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Voice Cloning</h3>
          <Mic2 className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">
                {voiceFile ? voiceFile.name : 'Upload voice sample'}
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
            </label>
          </div>

          {voiceFile && (
            <div className="space-y-4">
              <Button
                onClick={handleTrain}
                disabled={isTraining}
                className="w-full"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isTraining ? 'Training...' : 'Clone Voice'}
              </Button>

              {isTraining && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-gray-400">
                    {progress}% - Training voice model...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}