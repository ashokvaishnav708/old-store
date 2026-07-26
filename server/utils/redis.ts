import Redis from 'ioredis';
import { useRuntimeConfig } from '#imports';

let redis: Redis | undefined;

export function useRedis() {
  if (!redis) {
    const config = useRuntimeConfig();
    redis = new Redis(config.redisUrl as string, {
      maxRetriesPerRequest: 3,
      lazyConnect: false
    });
    redis.on('error', err => {
      console.error('[redis] connection error', err);
    });
  }
  return redis;
}

/**
 * Read-through JSON cache helper. Callers key by domain (`listing:${id}`,
 * `listings:list:${hash}`) so a change to a listing can selectively bust
 * both the item key and the relevant list keys.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const client = useRedis();
  const hit = await client.get(key);
  if (hit) return JSON.parse(hit) as T;

  const value = await loader();
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  return value;
}

export async function invalidate(...keysOrPatterns: string[]) {
  const client = useRedis();
  for (const pattern of keysOrPatterns) {
    if (pattern.includes('*')) {
      const keys = await client.keys(pattern);
      if (keys.length) await client.del(...keys);
    } else {
      await client.del(pattern);
    }
  }
}
