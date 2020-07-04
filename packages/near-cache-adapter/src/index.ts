export interface NearCacheAdapter {
  get: (key: string) => any;
  set: (key: string, value: any, maxAge?: number) => Promise<boolean>;
  del: (key: string) => any;
  close: () => Promise<boolean>;
  flushAll: () => Promise<boolean>;
}
