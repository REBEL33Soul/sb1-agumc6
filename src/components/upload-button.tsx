import { useState, useRef } from 'react';
import { Upload, Loader2, Music, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import axios from 'axios';

export function UploadButton() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [songName, setSongName] = useState('');
  const multipleFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !songName) return;
    await processFiles(Array.from(e.target.files));
  };

  const handleBulkUpload = async () => {
    if (!multipleFileRef.current?.files?.length) return;
    await processFiles(Array.from(multipleFileRef.current.files));
  };

  const processFiles = async (files: File[]) => {
    setLoading(true);
    const totalFiles = files.length;
    const projectIds = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', songName || file.name.split('.')[0]);

        const response = await axios.post('/api/projects', formData, {
          onUploadProgress: (progressEvent) => {
            const percentPerFile = 100 / totalFiles;
            const fileProgress = (progressEvent.loaded / (progressEvent.total || 1)) * percentPerFile;
            setProgress(Math.min(100, (i * percentPerFile) + fileProgress));
          }
        });

        projectIds.push(response.data.id);
      }

      if (projectIds.length === 1) {
        router.push(`/projects/${projectIds[0]}`);
      } else {
        router.push('/projects?batch=' + projectIds.join(','));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
      setProgress(0);
      setSongName('');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Song Name (required)"
        value={songName}
        onChange={(e) => setSongName(e.target.value)}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
      />

      <div className="flex gap-2">
        <Button
          onClick={() => document.getElementById('single-upload')?.click()}
          disabled={loading || !songName}
          className="flex-1"
        >
          <Upload className="h-5 w-5 mr-2" />
          Single Upload
        </Button>

        <Button
          onClick={() => multipleFileRef.current?.click()}
          disabled={loading || !songName}
          className="flex-1"
        >
          <Folder className="h-5 w-5 mr-2" />
          Bulk Upload
        </Button>
      </div>

      <input
        id="single-upload"
        type="file"
        accept="audio/*"
        onChange={handleSingleUpload}
        className="hidden"
      />

      <input
        ref={multipleFileRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleBulkUpload}
        className="hidden"
      />

      {loading && progress > 0 && (
        <div className="space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-400">
            Uploading... {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
}