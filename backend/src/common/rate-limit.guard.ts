import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type RateLimitOptions = { limit: number; ttlMs: number };
type Bucket = { count: number; resetAt: number };

const RATE_LIMIT_KEY = 'rate_limit';

// Controller ya route par lagao: @RateLimit(10) = 10 requests per minute
export const RateLimit = (limit: number, ttlMs = 60_000) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, ttlMs } satisfies RateLimitOptions);

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private lastSweep = Date.now();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<
      RateLimitOptions | undefined
    >(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]) ?? {
      limit: 100,
      ttlMs: 60_000,
    };

    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const ip: string = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const route = `${context.getClass().name}.${context.getHandler().name}`;
    const key = `${ip}:${route}`;
    const now = Date.now();

    // Purane buckets kabhi kabhi saaf karo taake memory na barhe
    if (now - this.lastSweep > 60_000) {
      for (const [k, b] of this.buckets) {
        if (b.resetAt <= now) this.buckets.delete(k);
      }
      this.lastSweep = now;
    }

    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.ttlMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > options.limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      throw new HttpException(
        'Too many requests. Please wait a moment and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}