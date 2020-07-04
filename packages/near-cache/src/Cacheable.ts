import { set, get, setNear, getNear, isValidCacheName } from './NearCache';
import { createCacheKey } from './NearCacheUtil';
import { CacheProps } from './interface';

export interface CacheableProps extends CacheProps {
  /**
   * Max age in SECONDS for cache client.
   * undefined will cache the data forever (e.g. without EXPIRE in Redis).
   * 0 or negative number will disable cache client.
   * Any other value will be ignored.
   */
  maxAge?: number;
  /**
   * Max age in MILLISECONDS for near cache in server memory.
   * undefined will cache the data to the maxNearAge of the near cache config.
   * 0 or negative number will disable near cache.
   * Any other value will be ignored.
   */
  maxNearAge?: number;
}

export const Cacheable = ({ cacheName, maxAge, maxNearAge, key }: CacheableProps) => {
  /**
   * target: the Class of the cacheable method
   * propertyKey: method name
   * descriptor: description of the method
   */
  return function async(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
      // eslint-disable-next-line no-param-reassign
      descriptor.value = async function (...args: any) {
        const selectedCacheName = cacheName && isValidCacheName(cacheName) ? cacheName : undefined;

        const cacheKey: string = `${key ? key(args) : createCacheKey(args)}`;

        if (selectedCacheName) {
          if (!Number.isNaN(maxNearAge) && maxNearAge > 0) {
            const existingNearValue = getNear(cacheName, cacheKey);
            if (existingNearValue !== undefined && existingNearValue !== null)
              return existingNearValue;
          }

          try {
            const existingValue = await get(cacheName, cacheKey);
            if (existingValue !== undefined && existingValue !== null) return existingValue;
          } catch (e) {
            console.warn(`Unable to access cacheName: ${cacheName} due to ${e}`);
          }
        }

        try {
          const result = await original.apply(this, args);

          if (selectedCacheName && result !== undefined && result !== null) {
            if (!Number.isNaN(maxNearAge) && maxNearAge > 0) {
              setNear(cacheName, cacheKey, result, maxNearAge);
            }
            try {
              await set(cacheName, cacheKey, result, maxAge);
            } catch (e) {
              console.warn(`Unable to store data to cacheName: ${cacheName} due to ${e}`);
            }
          }

          return result;
        } catch (e) {
          console.error(`Error: ${e}`);
          throw e;
        }
      };
    } else {
      console.warn(
        `Cacheable decorator only works for function. Do nothing for ${target}.${propertyKey}`
      );
    }
  };
};
