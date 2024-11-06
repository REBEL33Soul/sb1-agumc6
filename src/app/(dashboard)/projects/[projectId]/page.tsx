import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ProcessingControls } from '@/components/processing-controls';
import { AudioPlayer } from '@/components/audio-player';
import { ProcessingOptions } from '@/components/processing-options';
import { ExportOptions } from '@/components/export-options';

export default async function ProjectPage({
  params
}: {
  params: { projectId: string }
}) {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const project = await db.project.findUnique({
    where: { 
      id: params.projectId,
      userId,
    },
    include: {
      inputFile: true,
      outputFiles: true,
    },
  });

  if (!project) {
    redirect('/projects');
  }

  const isProcessingComplete = project.status === 'completed';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">{project.name}</h2>
        <p className="text-gray-400 mt-2">Audio restoration project</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Input Audio</h3>
            {project.inputFile && (
              <AudioPlayer
                url={project.inputFile.url}
                filename={project.inputFile.name}
              />
            )}
          </div>

          {project.outputFiles.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">
                Processed Audio
              </h3>
              {project.outputFiles.map((file) => (
                <AudioPlayer
                  key={file.id}
                  url={file.url}
                  filename={file.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ProcessingControls 
            projectId={project.id}
            status={project.status}
          />
          <ProcessingOptions
            projectId={project.id}
            settings={project.settings as any}
          />
          <ExportOptions
            projectId={project.id}
            isProcessingComplete={isProcessingComplete}
          />
        </div>
      </div>
    </div>
  );
}