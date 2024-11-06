import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadToR2 } from '@/lib/cloudflare';
import { AudioProcessor } from '@/lib/audio/processor';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Process the uploaded file
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `${userId}/${Date.now()}-${file.name}`;
    const url = await uploadToR2(buffer, key, file.type);

    // Analyze audio file
    const processor = AudioProcessor.getInstance();
    await processor.initialize();
    const audioConfig = await processor.analyzeAudio(await file.arrayBuffer());

    // Create project and file records
    const project = await db.project.create({
      data: {
        name,
        userId,
        status: 'pending',
        inputFile: {
          create: {
            name: file.name,
            url,
            type: 'audio',
            format: file.type,
            size: file.size,
            duration: audioConfig.duration,
          },
        },
        settings: {
          denoise: true,
          normalize: true,
          removeClipping: true,
          enhanceStereo: true,
          removeBackground: false,
        },
      },
      include: {
        inputFile: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_CREATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}