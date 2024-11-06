import { randomBytes } from 'crypto';

export class CSRFProtection {
  private static instance: CSRFProtection;
  private tokens: Map<string, { token: string; expires: number }> = new Map();
  private readonly TOKEN_EXPIRY = 3600000; // 1 hour

  private constructor() {}

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    this.tokens.set(sessionId, {
      token,
      expires: Date.now() + this.TOKEN_EXPIRY
    });
    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const storedData = this.tokens.get(sessionId);
    if (!storedData) return false;

    if (Date.now() > storedData.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    return storedData.token === token;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}