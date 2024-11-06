import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface ExportPanelProps {
  projectId: string;
  onExportComplete?: () => void;
}

export function ExportPanel({ projectId, onExportComplete }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const response = await fetch(`/api/projects/${projectId}/export-all`, {
        method: 'POST',
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const contentLength = +(response.headers.get('Content-Length') ?? 0);
      let receivedLength = 0;

      // Create a new array to store chunks
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        setProgress((receivedLength / contentLength) * 100);
      }

      // Combine all chunks into a single Uint8Array
      const chunksAll = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
      }

      // Create and download the zip file
      const blob = new Blob([chunksAll], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project-export.zip';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Export Project</h3>
          <Download className="h-5 w-5 text-blue-400" />
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Export all project files including video, audio, MIDI, and sheet music
          </p>

          {isExporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-400">
                Exporting project files... {Math.round(progress)}%
              </p>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export All Files
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}