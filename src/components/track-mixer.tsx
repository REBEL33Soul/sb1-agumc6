'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Volume2, Music, Mic, Drums } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  type: 'vocal' | 'instrument' | 'drums';
  buffer: AudioBuffer;
}

interface TrackMixerProps {
  tracks: Track[];
  onMixComplete: (mix: AudioBuffer) => void;
}

export function TrackMixer({ tracks, onMixComplete }: TrackMixerProps) {
  const [audioContext] = useState(() => new AudioContext());
  const [trackStates, setTrackStates] = useState<Map<string, {
    gain: number;
    pan: number;
    mute: boolean;
    solo: boolean;
  }>>(new Map());

  useEffect(() => {
    // Initialize track states
    const states = new Map();
    tracks.forEach(track => {
      states.set(track.id, {
        gain: 1,
        pan: 0,
        mute: false,
        solo: false
      });
    });
    setTrackStates(states);
  }, [tracks]);

  const updateTrackState = (
    trackId: string,
    property: 'gain' | 'pan' | 'mute' | 'solo',
    value: number | boolean
  ) => {
    setTrackStates(prev => {
      const newStates = new Map(prev);
      const currentState = newStates.get(trackId);
      if (currentState) {
        newStates.set(trackId, {
          ...currentState,
          [property]: value
        });
      }
      return newStates;
    });
  };

  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'vocal':
        return <Mic className="h-5 w-5" />;
      case 'drums':
        return <Drums className="h-5 w-5" />;
      default:
        return <Music className="h-5 w-5" />;
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">Track Mixer</h3>
      
      <div className="space-y-4">
        {tracks.map(track => {
          const state = trackStates.get(track.id);
          if (!state) return null;

          return (
            <div key={track.id} className="flex items-center space-x-4">
              <div className="w-8">
                {getTrackIcon(track.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">{track.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`px-2 py-1 text-xs rounded ${
                        state.mute ? 'bg-red-500' : 'bg-gray-700'
                      }`}
                      onClick={() => updateTrackState(track.id, 'mute', !state.mute)}
                    >
                      M
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded ${
                        state.solo ? 'bg-green-500' : 'bg-gray-700'
                      }`}
                      onClick={() => updateTrackState(track.id, 'solo', !state.solo)}
                    >
                      S
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Volume2 className="h-4 w-4 mr-2" />
                      <Slider
                        value={[state.gain * 100]}
                        onValueChange={([value]) => 
                          updateTrackState(track.id, 'gain', value / 100)
                        }
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      {Math.round(state.gain * 100)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Slider
                      value={[state.pan * 50 + 50]}
                      onValueChange={([value]) => 
                        updateTrackState(track.id, 'pan', (value - 50) / 50)
                      }
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="text-xs text-gray-400 text-center">
                      Pan: {state.pan === 0 ? 'C' : 
                            state.pan < 0 ? `L${Math.abs(Math.round(state.pan * 100))}` :
                            `R${Math.round(state.pan * 100)}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}