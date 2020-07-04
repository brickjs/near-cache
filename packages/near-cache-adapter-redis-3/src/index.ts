import { ClientOpts } from 'redis';
import { RedisCacheClient } from './RedisCacheClient';

export const createRedisCacheClient = (port: number, host?: string, options?: ClientOpts) => {
  return new RedisCacheClient(port, host, options);
};
