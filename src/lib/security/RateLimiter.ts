export class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, number[]> = new Map();
  private config = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max requests per window
  };

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkLimit(identifier: string): Promise<boolean> {
    this.cleanup();
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const requests = this.requests.get(identifier)!;
    const now = Date.now();
    requests.push(now);

    return requests.length <= this.config.max;
  }

  private cleanup() {
    const now = Date.now();
    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        time => now - time < this.config.windowMs
      );
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }
}