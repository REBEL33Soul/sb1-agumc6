import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VideoGenerator } from '@/lib/video/generator';
import { uploadToR2 } from '@/lib/cloudflare';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendProgress = async (progress: number) => {
    await writer.write(
      encoder.encode(JSON.stringify({ progress }) + '\n')
    );
  };

  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const singerImage = formData.get('singerImage') as File | null;
    const lyrics = formData.get('lyrics') as string | null;

    const project = await db.project.findUnique({
      where: { id: params.projectId, userId },
      include: { outputFiles: true },
    });

    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    const generator = VideoGenerator.getInstance();
    await generator.initialize();

    // Generate main video
    await sendProgress(20);
    const mainVideo = await generator.generateVideo({
      audioUrl: project.outputFiles[0].url,
      lyrics,
      singerImage: singerImage ? await singerImage.arrayBuffer() : undefined,
      resolution: { width: 3840, height: 2160 },
      hdr: true,
    });

    // Upload main video
    await sendProgress(50);
    const mainVideoKey = `${userId}/videos/${project.id}-main.mp4`;
    const mainVideoUrl = await uploadToR2(
      Buffer.from(mainVideo),
      mainVideoKey,
      'video/mp4'
    );

    // Generate social video
    await sendProgress(70);
    const socialVideo = await generator.generateSocialVideo(
      mainVideo,
      lyrics
    );

    // Upload social video
    await sendProgress(90);
    const socialVideoKey = `${userId}/videos/${project.id}-social.mp4`;
    const socialVideoUrl = await uploadToR2(
      Buffer.from(socialVideo),
      socialVideoKey,
      'video/mp4'
    );

    await writer.write(
      encoder.encode(
        JSON.stringify({
          progress: 100,
          urls: {
            main: mainVideoUrl,
            social: socialVideoUrl,
          },
        }) + '\n'
      )
    );
    await writer.close();

    return new Response(stream.readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('[VIDEO_GENERATION_ERROR]', error);
    await writer.abort(error as Error);
    return new NextResponse('Video generation failed', { status: 500 });
  }
}