import React, { useState, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';

interface ReferenceTrackProps {
  url: string;
  name: string;
  onRemove: () => void;
}

export function ReferenceTrack({ url, name, onRemove }: ReferenceTrackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-4 flex items-center gap-4">
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>
      
      <div className="flex-1">
        <p className="text-sm font-medium truncate">{name}</p>
        <div className="mt-1 h-2 bg-gray-600 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-200"
            style={{ 
              width: `${audioRef.current ? 
                (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      <button
        onClick={onRemove}
        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          // Force re-render to update progress bar
          setIsPlaying(prev => prev);
        }}
      />
    </div>
  );
}