import { redisClient } from '@cache/rediscache.client';
import { NextFunction, Request, Response } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * Creates a high-performance Redis Rate Limiter with automated In-Memory fallback
 * @param options Rate limiter configuration
 */
export function createRedisRateLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  message?: string;
}) {
  const memStore = new Map<string, RateLimitRecord>();

  // Cleanup in-memory records periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memStore.entries()) {
      if (now > record.resetTime) {
        memStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip =
      req.ip ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';
    const clientKey = String(ip);
    const prefix = options.keyPrefix || 'global';
    const redisKey = `ratelimit:${prefix}:${clientKey}`;

    try {
      const client = redisClient.getConnection();
      if (client && client.isReady) {
        const current = await client.incr(redisKey);
        if (current === 1) {
          await client.pExpire(redisKey, options.windowMs);
        }

        const ttl = await client.pTTL(redisKey);
        const resetEpoch = Date.now() + (ttl > 0 ? ttl : options.windowMs);

        res.setHeader('X-RateLimit-Limit', options.max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - current));
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetEpoch / 1000));

        if (current > options.max) {
          const retryAfterSeconds = Math.max(1, Math.ceil(ttl / 1000));
          res.setHeader('Retry-After', retryAfterSeconds);
          return res.status(429).json({
            status: 'error',
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message || 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار والمحاولة لاحقاً.',
            retryAfter: retryAfterSeconds,
          });
        }

        return next();
      }
    } catch (err) {
      // Redis error, fallback gracefully to in-memory store below
    }

    // In-memory fallback
    const now = Date.now();
    const record = memStore.get(clientKey);

    if (!record || now > record.resetTime) {
      memStore.set(clientKey, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', options.max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + options.windowMs) / 1000));
      return next();
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > options.max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        status: 'error',
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار والمحاولة لاحقاً.',
        retryAfter: retryAfterSeconds,
      });
    }

    return next();
  };
}
