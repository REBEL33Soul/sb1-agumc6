import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { Input } from './ui/input';

interface AlbumArtGeneratorProps {
  projectId: string;
  onArtGenerated: (urls: { static: string; animated: string }) => void;
}

export function AlbumArtGenerator({ projectId, onArtGenerated }: AlbumArtGeneratorProps) {
  const [customArt, setCustomArt] = useState<File | null>(null);
  const [artistName, setArtistName] = useState('');
  const [songName, setSongName] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [featuredArtist, setFeaturedArtist] = useState('');
  const [version, setVersion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleArtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setCustomArt(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const formData = new FormData();
      if (customArt) {
        formData.append('customArt', customArt);
      }
      formData.append('artistName', artistName);
      formData.append('songName', songName);
      formData.append('albumName', albumName);
      formData.append('featuredArtist', featuredArtist);
      formData.append('version', version);

      const response = await fetch(`/api/projects/${projectId}/generate-art`, {
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
          onArtGenerated(data.urls);
          break;
        }
      }
    } catch (error) {
      console.error('Album art generation failed:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Album Art Generator</h3>
          <ImageIcon className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg p-6">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">
                {customArt ? customArt.name : 'Upload custom art (optional)'}
              </span>
              <input
                type="file"
                onChange={handleArtUpload}
                accept="image/*"
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Artist Name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="bg-gray-900/50"
            />
            <Input
              placeholder="Song Name"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              className="bg-gray-900/50"
            />
            <Input
              placeholder="Album Name (optional)"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              className="bg-gray-900/50"
            />
            <Input
              placeholder="Featured Artist (optional)"
              value={featuredArtist}
              onChange={(e) => setFeaturedArtist(e.target.value)}
              className="bg-gray-900/50"
            />
            <Input
              placeholder="Version (optional)"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="bg-gray-900/50"
            />
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-400">
                Generating album art... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!customArt && !artistName && !songName)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Generate Album Art
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}