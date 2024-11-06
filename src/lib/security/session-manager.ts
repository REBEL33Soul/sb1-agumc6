import { db } from '@/lib/db';
import { generateSecret, generateTOTP } from '@/lib/security/totp';
import { encrypt, decrypt } from '@/lib/security/encryption';

export class SessionManager {
  private static instance: SessionManager;
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_SESSIONS = 5;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async createSession(userId: string): Promise<string> {
    // Clean up old sessions
    await this.cleanupSessions(userId);

    const token = await this.generateSessionToken();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);

    await db.session.create({
      data: {
        userId,
        token: await encrypt(token),
        expiresAt,
      },
    });

    return token;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await db.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return false;

    const decryptedToken = await decrypt(session.token);
    if (!decryptedToken) return false;

    if (session.expiresAt < new Date()) {
      await this.invalidateSession(sessionId);
      return false;
    }

    return true;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await db.session.delete({
      where: { id: sessionId },
    });
  }

  async setupMFA(userId: string): Promise<{
    backupCodes: string[];
    qrCode: string;
  }> {
    const secret = generateSecret();
    const backupCodes = this.generateBackupCodes();

    await db.user.update({
      where: { id: userId },
      data: {
        mfaSecret: await encrypt(secret),
        backupCodes: await encrypt(JSON.stringify(backupCodes)),
      },
    });

    const qrCode = await this.generateQRCode(secret);

    return {
      backupCodes,
      qrCode,
    };
  }

  async verifyMFA(userId: string, code: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user?.mfaSecret) return false;

    const secret = await decrypt(user.mfaSecret);
    if (!secret) return false;

    return generateTOTP(secret) === code;
  }

  private async cleanupSessions(userId: string): Promise<void> {
    const sessions = await db.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (sessions.length >= this.MAX_SESSIONS) {
      const sessionsToRemove = sessions.slice(this.MAX_SESSIONS - 1);
      await Promise.all(
        sessionsToRemove.map((session) =>
          this.invalidateSession(session.id)
        )
      );
    }
  }

  private async generateSessionToken(): Promise<string> {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    return Buffer.from(buffer).toString('base64');
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 15);
      codes.push(code);
    }
    return codes;
  }

  private async generateQRCode(secret: string): Promise<string> {
    // Implement QR code generation
    return '';
  }

  async rotateToken(sessionId: string): Promise<string> {
    const newToken = await this.generateSessionToken();
    
    await db.session.update({
      where: { id: sessionId },
      data: {
        token: await encrypt(newToken),
        rotatedAt: new Date(),
      },
    });

    return newToken;
  }
}