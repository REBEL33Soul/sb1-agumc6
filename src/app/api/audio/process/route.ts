import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { EnhancedAudioProcessor } from '@/lib/audio/enhanced-processor';
import { uploadToR2 } from '@/lib/cloudflare';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const options = JSON.parse(formData.get('options') as string);

    const processor = EnhancedAudioProcessor.getInstance();
    const audioData = await file.arrayBuffer();
    
    const processedBuffer = await processor.processAudio(audioData, options);

    // Upload processed file
    const key = `${userId}/processed-${Date.now()}.wav`;
    const url = await uploadToR2(Buffer.from(processedBuffer), key, 'audio/wav');

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[AUDIO_PROCESS_ERROR]', error);
    return new NextResponse('Processing failed', { status: 500 });
  }
}