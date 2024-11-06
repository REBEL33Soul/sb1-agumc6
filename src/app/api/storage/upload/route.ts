import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/cloudflare';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const key = formData.get('key') as string;

    if (!file || !key) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, key, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error);
    return new NextResponse('Upload failed', { status: 500 });
  }
}