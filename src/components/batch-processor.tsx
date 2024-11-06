'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { ProcessingOptions } from '@/types/audio';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface BatchProcessorProps {
  projectIds: string[];
  onComplete: () => void;
}

export function BatchProcessor({ projectIds, onComplete }: BatchProcessorProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const startProcessing = async () => {
    setProcessing(true);
    
    for (const projectId of projectIds) {
      try {
        setProgress(prev => ({ ...prev, [projectId]: 0 }));
        
        const response = await fetch(`/api/projects/${projectId}/process`, {
          method: 'POST',
        });

        if (!response.ok) throw new Error('Processing failed');

        // Poll for progress
        while (progress[projectId] < 100) {
          const progressResponse = await fetch(`/api/projects/${projectId}/progress`);
          const data = await progressResponse.json();
          
          setProgress(prev => ({ ...prev, [projectId]: data.progress }));
          
          if (data.status === 'completed') {
            setCompleted(prev => ({ ...prev, [projectId]: true }));
            break;
          }
          
          if (data.status === 'failed') {
            throw new Error(data.error || 'Processing failed');
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        setErrors(prev => ({ 
          ...prev, 
          [projectId]: error instanceof Error ? error.message : 'Processing failed' 
        }));
      }
    }
    
    setProcessing(false);
    onComplete();
  };

  return (
    <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Batch Processing</h3>
          <button
            onClick={startProcessing}
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Start Processing'
            )}
          </button>
        </div>

        <div className="space-y-2">
          {projectIds.map(projectId => (
            <div key={projectId} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Project {projectId}</span>
                  {completed[projectId] ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : errors[projectId] ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    <span className="text-sm text-gray-400">{progress[projectId]}%</span>
                  )}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress[projectId] || 0}%` }}
                  />
                </div>
                {errors[projectId] && (
                  <p className="text-sm text-red-400 mt-1">{errors[projectId]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}