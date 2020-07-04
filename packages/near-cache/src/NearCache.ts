import { NearCacheAdapter } from 'near-cache-adapter';

const cacheMap = new Map<string, NearCacheAdapter>();
const LRU = require('lru-cache');

const nearCache = new LRU({
  max: process.env.BRICKJS_NEAR_CACHE_MAX || process.env.NEAR_CACHE_MAX,
  maxAge: process.env.BRICKJS_NEAR_CACHE_MAX_AGE || process.env.NEAR_CACHE_MAX_AGE,
});

export const getCacheMap = () => {
  return cacheMap;
};

export const addCache = (cacheName: string, cacheClient: NearCacheAdapter) => {
  if (!cacheName) {
    throw new Error('cacheName is required!');
  }
  if (cacheMap.has(cacheName)) throw new Error(`cacheName ${cacheName} is existed!`);

  cacheMap.set(cacheName, cacheClient);
};

export const isValidCacheName = (cacheName: string) => {
  return cacheMap.has(cacheName);
};

export const getCache = (cacheName: string) => {
  if (cacheName) {
    if (cacheMap.has(cacheName)) {
      return cacheMap.get(cacheName);
    }
    throw new Error(`cacheName ${cacheName} is not found!`);
  }
  throw new Error(`There is no cache available!`);
};

export const closeAllCacheClients = async () => {
  const promises = Array.from(cacheMap.values()).map(async (client) => {
    return client.close();
  });
  await Promise.all(promises);
};

export const flushAllCacheClients = async () => {
  const promises = Array.from(cacheMap.values()).map(async (client) => {
    return client.flushAll();
  });
  await Promise.all(promises);
};

export const get = (cacheName: string, key: string): Promise<any> => {
  const cacheClient = getCache(cacheName);
  return cacheClient.get(`${cacheName}:${key}`);
};

export const set = (cacheName: string, key: string, value: any, maxAge?: number) => {
  const cacheClient = getCache(cacheName);
  return cacheClient.set(`${cacheName}:${key}`, value, maxAge);
};

export const del = (cacheName: string, key: string): Promise<any> => {
  const cacheClient = getCache(cacheName);
  return cacheClient.del(`${cacheName}:${key}`);
};

export const getNear = (cacheName: string, key: string): string => {
  return nearCache.get(`${cacheName}:${key}`);
};

export const setNear = (
  cacheName: string,
  key: string,
  value: string,
  maxNearAge?: number
): string => {
  nearCache.set(`${cacheName}:${key}`, value, maxNearAge);
  return value;
};

export const delNear = (cacheName: string, key: string): string => {
  return nearCache.del(`${cacheName}:${key}`);
};

export const dumpNear = () => {
  return nearCache.dump();
};

export const resetNear = () => {
  return nearCache.reset();
};

/**
 * Return total quantity of objects currently in cache including stale items.
 */
export const getNearItemCount = () => {
  return nearCache.itemCount;
};

/**
 * Close all Cache Clients and purge all caches
 */
export const close = () => {
  closeAllCacheClients();
  cacheMap.clear();
  resetNear();
};
