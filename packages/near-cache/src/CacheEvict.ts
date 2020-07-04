import { del, delNear, isValidCacheName } from './NearCache';
import { createCacheKey } from './NearCacheUtil';
import { CacheProps } from './interface';

export interface CacheEvictProps extends CacheProps {}

export const CacheEvict = ({ cacheName, key }: CacheEvictProps) => {
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
            try {
              await del(cacheName, cacheKey);
              await delNear(cacheName, cacheKey);
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
        `CacheEvict decorator only works for function. Do nothing for ${target}.${propertyKey}`
      );
    }
  };
};
