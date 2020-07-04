import { set, setNear, isValidCacheName } from './NearCache';
import { createCacheKey } from './NearCacheUtil';
import { CacheableProps } from './Cacheable';

export interface CachePutProps extends CacheableProps {}

export const CachePut = ({ cacheName, maxAge, maxNearAge, key }: CachePutProps) => {
  /**
   * target the Class of the cacheable method
   * propertyKey method name
   * descriptor description of the method
   */
  return function async(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
      // eslint-disable-next-line no-param-reassign
      descriptor.value = async function (...args: any) {
        const selectedCacheName = cacheName && isValidCacheName(cacheName) ? cacheName : undefined;

        const cacheKey: string = `${key ? key(args) : createCacheKey(args)}`;

        try {
          const result = await original.apply(this, args);

          if (selectedCacheName) {
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
          console.log(`Error: ${e}`);
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
