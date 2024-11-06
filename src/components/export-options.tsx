'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { EXPORT_FORMATS, type ExportFormat } from '@/types/audio';
import { Download, Loader2 } from 'lucide-react';

interface ExportOptionsProps {
  projectId: string;
  isProcessingComplete: boolean;
}

export function ExportOptions({ projectId, isProcessingComplete }: ExportOptionsProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setExporting(format.id);
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-audio.${format.extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
    }
  };

  if (!isProcessingComplete) {
    return null;
  }

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">Export Options</h3>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {EXPORT_FORMATS.map((format) => (
          <button
            key={format.id}
            onClick={() => handleExport(format)}
            disabled={!!exporting}
            className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <div className="text-left">
              <p className="text-white font-medium">{format.name}</p>
              <p className="text-sm text-gray-400">
                {format.sampleRate / 1000}kHz / {format.bitDepth}bit
              </p>
            </div>
            {exporting === format.id ? (
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            ) : (
              <Download className="h-5 w-5 text-gray-400" />
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}