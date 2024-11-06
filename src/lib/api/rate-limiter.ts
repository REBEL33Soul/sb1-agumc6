export class APIRateLimiter {
  private static instance: APIRateLimiter;
  private limits: Map<string, {
    count: number;
    resetTime: number;
  }> = new Map();

  private readonly WINDOW_MS = 60000; // 1 minute
  private readonly CLEANUP_INTERVAL = 300000; // 5 minutes

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): APIRateLimiter {
    if (!APIRateLimiter.instance) {
      APIRateLimiter.instance = new APIRateLimiter();
    }
    return APIRateLimiter.instance;
  }

  async checkLimit(apiKey: string, tier: string): Promise<boolean> {
    const now = Date.now();
    const key = `${apiKey}:${tier}`;
    const limit = this.limits.get(key);

    if (!limit || now > limit.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.WINDOW_MS
      });
      return true;
    }

    if (limit.count >= this.getMaxRequests(tier)) {
      return false;
    }

    limit.count++;
    return true;
  }

  private getMaxRequests(tier: string): number {
    const limits = {
      free: 10,
      basic: 30,
      pro: 100,
      enterprise: 500
    };
    return limits[tier] || 10;
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, limit] of this.limits.entries()) {
        if (now > limit.resetTime) {
          this.limits.delete(key);
        }
      }
    }, this.CLEANUP_INTERVAL);
  }
}