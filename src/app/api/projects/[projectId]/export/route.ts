import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AudioProcessor } from '@/lib/audio/processor';
import { ExportFormat } from '@/types/audio';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { format } = await req.json() as { format: ExportFormat };

    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
        userId,
      },
      include: {
        outputFiles: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!project || !project.outputFiles.length) {
      return new NextResponse('Project not found or not processed', { status: 404 });
    }

    const processor = AudioProcessor.getInstance();
    await processor.initialize();

    const response = await fetch(project.outputFiles[0].url);
    const audioData = await response.arrayBuffer();

    const exportedBuffer = await processor.exportAudio(audioData, format);

    return new NextResponse(exportedBuffer, {
      headers: {
        'Content-Type': `audio/${format.extension}`,
        'Content-Disposition': `attachment; filename="processed-audio.${format.extension}"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT_ERROR]', error);
    return new NextResponse('Export failed', { status: 500 });
  }
}