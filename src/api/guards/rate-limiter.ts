import { NextFunction, Request, Response } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Creates an in-memory Rate Limiter middleware for Express
 * @param windowMs Time window in milliseconds (e.g., 15 * 60 * 1000 = 15 minutes)
 * @param max Maximum number of requests allowed within windowMs per IP
 * @param message Custom message returned on 429
 */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodically clean expired records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const clientKey = String(ip);
    const now = Date.now();

    const record = store.get(clientKey);

    if (!record || now > record.resetTime) {
      store.set(clientKey, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return next();
    }

    record.count++;

    if (record.count > options.max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        status: 'error',
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار والمحاولة لاحقاً.',
        retryAfter: retryAfterSeconds,
      });
    }

    return next();
  };
}
