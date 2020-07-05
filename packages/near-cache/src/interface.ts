export interface CacheProps {
  /**
   * cacheName to represent a concept, a domain or a table name.
   */
  cacheName: string;
  /**
   * Custom function to generate custom cache key.
   * result will be supplied for @CachePut
   * @param args are the arguments of the cached function
   */
  key?: (args: IArguments, result?: any) => string;
}
