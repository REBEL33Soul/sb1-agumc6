import { Project, File } from '@prisma/client';
import { Music, Clock, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project & {
    inputFile: File | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="p-6 bg-gray-800/50 backdrop-blur-xl border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-700 rounded-lg">
              <Music className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{project.name}</h3>
              <p className="text-sm text-gray-400">
                {project.inputFile?.format.toUpperCase()}
              </p>
            </div>
          </div>
          <div className={`h-3 w-3 rounded-full ${statusColors[project.status as keyof typeof statusColors]}`} />
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-400">
          <Clock className="h-4 w-4 mr-1" />
          {project.inputFile?.duration
            ? `${Math.round(project.inputFile.duration)}s`
            : 'Processing...'}
        </div>

        {project.status === 'failed' && (
          <div className="mt-4 flex items-center text-sm text-red-400">
            <AlertCircle className="h-4 w-4 mr-1" />
            Processing failed
          </div>
        )}
      </Card>
    </Link>
  );
}