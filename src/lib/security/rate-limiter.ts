interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

const RULES: Record<string, RateLimitRule> = {
  default: { windowMs: 60000, maxRequests: 100 },
  auth: { windowMs: 300000, maxRequests: 5 },
  api: { windowMs: 60000, maxRequests: 50 },
};

const requests = new Map<string, number[]>();

export async function rateLimit(
  ip: string,
  action: keyof typeof RULES = 'default'
): Promise<boolean> {
  const rule = RULES[action];
  const key = `${ip}:${action}`;
  const now = Date.now();

  if (!requests.has(key)) {
    requests.set(key, []);
  }

  const timestamps = requests.get(key)!;
  const windowStart = now - rule.windowMs;

  // Remove old timestamps
  while (timestamps.length > 0 && timestamps[0] < windowStart) {
    timestamps.shift();
  }

  if (timestamps.length >= rule.maxRequests) {
    return false;
  }

  timestamps.push(now);
  return true;
}