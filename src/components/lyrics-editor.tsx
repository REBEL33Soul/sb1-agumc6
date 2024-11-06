import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Mic, Languages, Music, Edit3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LyricsEditorProps {
  projectId: string;
  initialLyrics?: string;
  onUpdate: (lyrics: string) => void;
}

export function LyricsEditor({ projectId, initialLyrics = '', onUpdate }: LyricsEditorProps) {
  const [lyrics, setLyrics] = useState(initialLyrics);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/transcribe`);
      const data = await response.json();
      setLyrics(data.lyrics);
      onUpdate(data.lyrics);
    } catch (error) {
      console.error('Transcription failed:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-lyrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: lyrics }),
      });
      const data = await response.json();
      setLyrics(data.lyrics);
      onUpdate(data.lyrics);
    } catch (error) {
      console.error('Lyrics generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTranslate = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/translate-lyrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics, targetLanguage }),
      });
      const data = await response.json();
      setLyrics(data.translatedLyrics);
      onUpdate(data.translatedLyrics);
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Lyrics</h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              variant="outline"
              size="sm"
            >
              <Mic className="h-4 w-4 mr-2" />
              {isTranscribing ? 'Transcribing...' : 'Transcribe'}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>

        <Textarea
          value={lyrics}
          onChange={(e) => {
            setLyrics(e.target.value);
            onUpdate(e.target.value);
          }}
          placeholder="Enter or transcribe lyrics..."
          className="min-h-[200px] bg-gray-900/50"
        />

        <div className="flex items-center space-x-4">
          <Select
            value={targetLanguage}
            onValueChange={setTargetLanguage}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleTranslate} variant="outline" size="sm">
            <Languages className="h-4 w-4 mr-2" />
            Translate
          </Button>
        </div>
      </div>
    </Card>
  );
}