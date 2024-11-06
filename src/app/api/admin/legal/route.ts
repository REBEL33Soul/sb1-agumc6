import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const documents = await db.legalDocument.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('[LEGAL_GET_ERROR]', error);
    return new NextResponse('Failed to fetch legal documents', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id, content, type } = await req.json();

    const document = await db.legalDocument.update({
      where: { id },
      data: {
        content,
        type,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('[LEGAL_UPDATE_ERROR]', error);
    return new NextResponse('Failed to update legal document', { status: 500 });
  }
}