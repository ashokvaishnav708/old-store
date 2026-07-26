import { useRedis } from './redis';

/**
 * Fixed-window rate limiter backed by Redis. Used to slow down brute-force
 * attempts on auth endpoints without needing any extra infrastructure.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const client = useRedis();
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, windowSeconds);
  }
  if (count > limit) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests, please try again later.'
    });
  }
}
