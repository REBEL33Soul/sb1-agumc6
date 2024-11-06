import { rateLimit } from '@/lib/security/rate-limiter';
import { SessionManager } from '@/lib/security/session-manager';
import { SecurityHeaders } from '@/lib/security/headers';
import { BiometricAuth } from './biometric';

export class SecurityManager {
  private static instance: SecurityManager;
  private sessionManager: SessionManager;
  private biometricAuth: BiometricAuth;

  private constructor() {
    this.sessionManager = SessionManager.getInstance();
    this.biometricAuth = BiometricAuth.getInstance();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    return this.sessionManager.validateSession(sessionId);
  }

  async checkRateLimit(ip: string, action: string): Promise<boolean> {
    return rateLimit(ip, action);
  }

  getSecurityHeaders(): Record<string, string> {
    return SecurityHeaders.getHeaders();
  }

  async setupMFA(userId: string): Promise<{
    backupCodes: string[];
    qrCode: string;
  }> {
    return this.sessionManager.setupMFA(userId);
  }

  async verifyMFA(userId: string, code: string): Promise<boolean> {
    return this.sessionManager.verifyMFA(userId, code);
  }

  async rotateSessionToken(sessionId: string): Promise<string> {
    return this.sessionManager.rotateToken(sessionId);
  }
}