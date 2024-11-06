import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Input } from './ui/input';

interface VideoGeneratorProps {
  projectId: string;
  lyrics?: string;
  onVideoGenerated: (urls: { main: string; social: string }) => void;
}

export function VideoGenerator({ projectId, lyrics, onVideoGenerated }: VideoGeneratorProps) {
  const [singerImage, setSingerImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSingerImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const formData = new FormData();
      if (singerImage) {
        formData.append('singerImage', singerImage);
      }
      if (lyrics) {
        formData.append('lyrics', lyrics);
      }

      const response = await fetch(`/api/projects/${projectId}/generate-video`, {
        method: 'POST',
        body: formData,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const data = JSON.parse(new TextDecoder().decode(value));
        setProgress(data.progress);

        if (data.urls) {
          onVideoGenerated(data.urls);
          break;
        }
      }
    } catch (error) {
      console.error('Video generation failed:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Video Generator</h3>
          <Video className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">
                {singerImage ? singerImage.name : 'Upload singer image (optional)'}
              </span>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </label>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-400">
                Generating videos... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Generate Videos
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}