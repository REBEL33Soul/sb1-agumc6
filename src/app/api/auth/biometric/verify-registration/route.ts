import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { registration } = await req.json();

    // Get stored challenge
    const storedChallenge = await db.challenge.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedChallenge) {
      return new NextResponse('Challenge not found', { status: 400 });
    }

    // Verify registration
    const verification = await verifyRegistrationResponse({
      response: registration,
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN!,
      expectedRPID: process.env.WEBAUTHN_RP_ID!,
    });

    if (verification.verified) {
      // Store credential
      await db.credential.create({
        data: {
          userId,
          credentialID: Buffer.from(verification.registrationInfo.credentialID),
          publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey),
          counter: verification.registrationInfo.counter,
        },
      });

      return new NextResponse(null, { status: 200 });
    }

    return new NextResponse('Verification failed', { status: 400 });
  } catch (error) {
    console.error('[BIOMETRIC_VERIFY_REGISTRATION_ERROR]', error);
    return new NextResponse('Verification failed', { status: 500 });
  }
}