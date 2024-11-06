import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ArtGenerator } from '@/lib/art/generator';
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
    const customArt = formData.get('customArt') as File | null;
    const artistName = formData.get('artistName') as string;
    const songName = formData.get('songName') as string;
    const albumName = formData.get('albumName') as string;
    const featuredArtist = formData.get('featuredArtist') as string;
    const version = formData.get('version') as string;

    const generator = ArtGenerator.getInstance();
    await generator.initialize();

    // Generate or process static art
    await sendProgress(30);
    const staticArt = customArt
      ? await customArt.arrayBuffer()
      : await generator.generateArt({
          artistName,
          songName,
          albumName,
          featuredArtist,
          version,
        });

    // Upload static art
    await sendProgress(60);
    const staticArtKey = `${userId}/art/${params.projectId}-static.jpg`;
    const staticArtUrl = await uploadToR2(
      Buffer.from(staticArt),
      staticArtKey,
      'image/jpeg'
    );

    // Generate animated art
    await sendProgress(80);
    const animatedArt = await generator.generateAnimatedArt(
      staticArt,
      { duration: 5 }
    );

    // Upload animated art
    await sendProgress(90);
    const animatedArtKey = `${userId}/art/${params.projectId}-animated.mp4`;
    const animatedArtUrl = await uploadToR2(
      Buffer.from(animatedArt),
      animatedArtKey,
      'video/mp4'
    );

    await writer.write(
      encoder.encode(
        JSON.stringify({
          progress: 100,
          urls: {
            static: staticArtUrl,
            animated: animatedArtUrl,
          },
        }) + '\n'
      )
    );
    await writer.close();

    return new Response(stream.readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('[ART_GENERATION_ERROR]', error);
    await writer.abort(error as Error);
    return new NextResponse('Art generation failed', { status: 500 });
  }
}