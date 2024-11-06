import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export class BiometricAuth {
  private static instance: BiometricAuth;

  private constructor() {}

  static getInstance(): BiometricAuth {
    if (!BiometricAuth.instance) {
      BiometricAuth.instance = new BiometricAuth();
    }
    return BiometricAuth.instance;
  }

  async isBiometricsAvailable(): Promise<boolean> {
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  async register(userId: string): Promise<boolean> {
    try {
      // Get registration options from server
      const resp = await fetch('/api/auth/biometric/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const options = await resp.json();

      // Create credentials
      const registration = await startRegistration(options);

      // Verify registration with server
      const verifyResp = await fetch('/api/auth/biometric/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration }),
      });

      return verifyResp.ok;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      return false;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      // Get authentication options from server
      const resp = await fetch('/api/auth/biometric/auth-options');
      const options = await resp.json();

      // Perform authentication
      const authentication = await startAuthentication(options);

      // Verify authentication with server
      const verifyResp = await fetch('/api/auth/biometric/verify-authentication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authentication }),
      });

      return verifyResp.ok;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }
}