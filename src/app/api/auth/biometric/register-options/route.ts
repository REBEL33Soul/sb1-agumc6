import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const options = await generateRegistrationOptions({
      rpName: 'Replicator Studio',
      rpID: process.env.WEBAUTHN_RP_ID!,
      userID: userId,
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
    });

    // Store challenge in database
    await db.challenge.create({
      data: {
        userId,
        challenge: options.challenge,
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('[BIOMETRIC_REGISTER_OPTIONS_ERROR]', error);
    return new NextResponse('Failed to generate options', { status: 500 });
  }
}