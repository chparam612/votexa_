import { getSecret } from './secrets';

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

let redisClient: any = null;

const getRedisClient = async () => {
  if (!isNode) return null;
  if (redisClient) return redisClient;

  const redisUrl = await getSecret('REDIS_URL');
  if (!redisUrl) return null;

  const { createClient } = eval('require')('redis');
  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
  await redisClient.connect();
  return redisClient;
};

export const getCached = async <T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T> => {
  if (isNode) {
    const client = await getRedisClient();
    if (client) {
      const cached = await client.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    }
  }

  // Fallback to fetch
  const freshData = await fetchFn();

  if (isNode) {
    const client = await getRedisClient();
    if (client) {
      await client.setEx(key, ttlSeconds, JSON.stringify(freshData));
    }
  }

  return freshData;
};

export const invalidateCache = async (key: string): Promise<void> => {
  if (isNode) {
    const client = await getRedisClient();
    if (client) {
      await client.del(key);
    }
  }
};

export const invalidateUserCache = async (userId: string): Promise<void> => {
  await invalidateCache(`dashboard:${userId}`);
  await invalidateCache(`risk:${userId}`);
};
