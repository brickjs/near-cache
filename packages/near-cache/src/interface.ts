export interface CacheProps {
  /**
   * cacheName to represent a concept, a domain or a table name.
   */
  cacheName: string;
  /**
   * Custom function to generate custom cache key
   * @param args are the arguments of the cached function
   */
  key?: (args: IArguments) => string;
}
