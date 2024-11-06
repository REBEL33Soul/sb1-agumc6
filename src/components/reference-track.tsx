import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Sliders, Waveform } from 'lucide-react';
import { AudioPlayer } from './audio-player';

interface ReferenceTrackProps {
  projectId: string;
  onReferenceAnalyzed: (analysis: any) => void;
}

export function ReferenceTrack({ projectId, onReferenceAnalyzed }: ReferenceTrackProps) {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    setReferenceFile(file);

    // Create temporary URL for audio player
    const url = URL.createObjectURL(file);
    setReferenceUrl(url);

    // Upload and analyze reference track
    const formData = new FormData();
    formData.append('reference', file);

    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/analyze-reference`, {
        method: 'POST',
        body: formData,
      });

      const analysis = await response.json();
      onReferenceAnalyzed(analysis);
    } catch (error) {
      console.error('Reference analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Reference Track</h3>
          <Waveform className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">
                {referenceFile ? referenceFile.name : 'Upload reference track'}
              </span>
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
            </label>
          </div>

          {referenceUrl && (
            <div className="space-y-4">
              <AudioPlayer url={referenceUrl} filename={referenceFile?.name || ''} />
              
              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <Sliders className="h-4 w-4 animate-pulse" />
                  <span>Analyzing reference track...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}