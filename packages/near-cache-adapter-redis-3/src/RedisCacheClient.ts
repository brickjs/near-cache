import Redis, { ClientOpts, RedisClient } from 'redis';
import { NearCacheAdapter } from 'near-cache-adapter';

/**
 * Return a unique id of the Redis Client configuration.
 */
export const getRedisClientId = (port: number, host?: string, options?: ClientOpts) => {
  const argsString = JSON.stringify({ port, host, options });
  const buff = Buffer.from(argsString);
  return buff.toString('base64');
};

export class RedisCacheClient implements NearCacheAdapter {
  cacheClientId: string;

  redisClient: RedisClient;

  constructor(port: number, host?: string, options?: ClientOpts) {
    this.redisClient = Redis.createClient(port, host, options);
    this.cacheClientId = getRedisClientId(port, host, options);
  }

  get(key: string) {
    return new Promise((resolve, reject) => {
      this.redisClient.get(key, (error, reply) => {
        if (error) reject(error);
        resolve(JSON.parse(reply));
      });
    });
  }

  set(key: string, value: any, maxAge?: number) {
    return new Promise<boolean>((resolve, reject) => {
      let stringValue: string = '';
      try {
        stringValue = JSON.stringify(value);
      } catch (e) {
        console.error(`Unable to stringify for key:${key}. key:${key}. value:${value}`);
        reject(e);
      }
      this.redisClient.set(key, stringValue, (setError) => {
        if (setError) {
          reject(setError);
        }
        if (!Number.isNaN(maxAge) && maxAge > 0) {
          this.redisClient.expire(key, maxAge, (expireError) => {
            if (expireError) {
              reject(expireError);
            }
            resolve(true);
          });
        }
        resolve(true);
      });
    });
  }

  del(key: string) {
    return new Promise((resolve, reject) => {
      this.redisClient.del(key, (error) => {
        if (error) reject(error);
        resolve(true);
      });
    });
  }

  flushAll() {
    return new Promise<boolean>((resolve, reject) => {
      this.redisClient.flushall((error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      });
    });
  }

  close() {
    return new Promise<boolean>((resolve, reject) => {
      this.redisClient.quit((error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      });
    });
  }
}
