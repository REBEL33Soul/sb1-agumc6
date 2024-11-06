import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { UploadButton } from '@/components/upload-button';
import { ProjectCard } from '@/components/project-card';

export default async function ProjectsPage() {
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const projects = await db.project.findMany({
    where: { userId },
    include: { inputFile: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Your Projects</h2>
          <p className="text-gray-400 mt-2">Upload and manage your audio projects</p>
        </div>
        <UploadButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}