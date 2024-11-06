import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, Edit2, Trash2, Music, Wand2 } from 'lucide-react';
import { AudioPlayer } from './audio-player';

interface PlaylistItem {
  id: string;
  name: string;
  url: string;
  timestamp: Date;
  settings: any;
}

interface PlaylistManagerProps {
  projectId: string;
  items: PlaylistItem[];
  onDelete: (id: string) => void;
  onReprocess: (id: string, settings: any) => void;
  onInpaint: (id: string) => void;
}

export function PlaylistManager({
  projectId,
  items,
  onDelete,
  onReprocess,
  onInpaint
}: PlaylistManagerProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handlePlay = (id: string) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(id);
    }
  };

  const handleEdit = (id: string) => {
    setEditingItem(id);
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Generation History</h3>
          <Music className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900/50 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>

              <AudioPlayer url={item.url} filename={item.name} />

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReprocess(item.id, item.settings)}
                  className="flex-1"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Reprocess
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInpaint(item.id)}
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Inpaint
                </Button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No generations yet
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}