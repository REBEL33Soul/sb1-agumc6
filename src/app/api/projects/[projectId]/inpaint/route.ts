import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AudioProcessor } from '@/lib/audio/processor';
import { uploadToR2 } from '@/lib/cloudflare';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { generationId, regions } = await req.json();

    const generation = await db.generation.findFirst({
      where: {
        id: generationId,
        projectId: params.projectId,
        project: { userId },
      },
      include: {
        outputFile: true,
      },
    });

    if (!generation) {
      return new NextResponse('Generation not found', { status: 404 });
    }

    // Process audio with inpainting
    const processor = AudioProcessor.getInstance();
    const response = await fetch(generation.outputFile!.url);
    const audioData = await response.arrayBuffer();
    
    const processedBuffer = await processor.inpaintAudio(audioData, regions);

    // Upload processed file
    const outputKey = `${userId}/inpainted-${Date.now()}.wav`;
    const outputUrl = await uploadToR2(
      Buffer.from(processedBuffer),
      outputKey,
      'audio/wav'
    );

    // Create new generation
    const newGeneration = await db.generation.create({
      data: {
        name: `${generation.name} (Inpainted)`,
        settings: generation.settings,
        projectId: params.projectId,
        outputFile: {
          create: {
            name: `inpainted-${Date.now()}.wav`,
            url: outputUrl,
            type: 'audio',
            format: 'audio/wav',
            size: processedBuffer.byteLength,
          },
        },
      },
      include: {
        outputFile: true,
      },
    });

    return NextResponse.json(newGeneration);
  } catch (error) {
    console.error('[INPAINT_ERROR]', error);
    return new NextResponse('Inpainting failed', { status: 500 });
  }
}