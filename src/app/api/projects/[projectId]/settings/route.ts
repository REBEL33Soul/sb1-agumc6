import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = await req.json();

    const project = await db.project.update({
      where: {
        id: params.projectId,
        userId,
      },
      data: {
        settings,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[SETTINGS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}