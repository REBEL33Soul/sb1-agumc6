import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const generations = await db.generation.findMany({
      where: {
        projectId: params.projectId,
        project: { userId },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        outputFile: true,
      },
    });

    return NextResponse.json(generations);
  } catch (error) {
    console.error('[GENERATIONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { generationId } = await req.json();

    const generation = await db.generation.findFirst({
      where: {
        id: generationId,
        projectId: params.projectId,
        project: { userId },
      },
    });

    if (!generation) {
      return new NextResponse('Generation not found', { status: 404 });
    }

    await db.generation.delete({
      where: { id: generationId },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[GENERATION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}