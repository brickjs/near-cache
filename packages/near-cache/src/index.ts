export { Cacheable } from './Cacheable';
export { CacheEvict } from './CacheEvict';
export { CachePut } from './CachePut';
export {
  isValidCacheName,
  get,
  set,
  getNear,
  setNear,
  dumpNear,
  getNearItemCount,
  resetNear,
  addCache,
  close,
  closeAllCacheClients,
  flushAllCacheClients,
} from './NearCache';
