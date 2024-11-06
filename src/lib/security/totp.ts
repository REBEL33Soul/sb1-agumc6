import { createHmac } from 'crypto';

export function generateSecret(): string {
  return Buffer.from(randomBytes(20)).toString('base64');
}

export function generateTOTP(secret: string, window: number = 30): string {
  const counter = Math.floor(Date.now() / 1000 / window);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter));

  const hmac = createHmac('sha1', Buffer.from(secret, 'base64'));
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();

  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code = (
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}