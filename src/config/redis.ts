import Redis from 'ioredis';
import { ENV } from './env.config';
import { logger } from './logger';

export let redisClient: Redis | null = null;

try {
  redisClient = new Redis(ENV.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redisClient.on('connect', () => logger.info('⚡ Connected to Redis Cache Engine'));
  redisClient.on('error', (err) => logger.warn(`[Redis Warning] Redis connection skipped/unavailable: ${err.message}`));
} catch (e) {
  logger.warn('[Redis Warning] Operating with in-memory fallback cache.');
}

// In-Memory Fallback Cache if Redis is unavailable
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

export const CacheService = {
  async get(key: string): Promise<string | null> {
    if (redisClient && redisClient.status === 'ready') {
      try {
        return await redisClient.get(key);
      } catch (e) {}
    }
    const cached = memoryCache.get(key);
    if (cached) {
      if (Date.now() > cached.expiresAt) {
        memoryCache.delete(key);
        return null;
      }
      return cached.value;
    }
    return null;
  },

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (e) {}
    }
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async del(key: string): Promise<void> {
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.del(key);
        return;
      } catch (e) {}
    }
    memoryCache.delete(key);
  }
};
