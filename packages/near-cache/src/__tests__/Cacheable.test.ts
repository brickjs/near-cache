import { createRedisCacheClient } from 'near-cache-adapter-redis-3';
import * as NearCache from '../NearCache';
import { Customer } from './Customer';
import { CustomerRepository } from './CustomerRepository';
import { CustomerService } from './CustomerService';
import { CustomerNearService } from './CustomerNearService';

const redisCacheClient = createRedisCacheClient(6379);

describe('Cacheable', () => {
  const customerRepository = new CustomerRepository();
  const customerRepositoryFindOneSpy = jest.spyOn(customerRepository, 'findOne');

  const nearRedisGetSpy = jest.spyOn(NearCache, 'get');
  const nearRedisSetSpy = jest.spyOn(NearCache, 'set');
  const nearGetNearSpy = jest.spyOn(NearCache, 'getNear');
  const nearSetNearSpy = jest.spyOn(NearCache, 'setNear');

  beforeAll(async () => {
    NearCache.addCache('customer', redisCacheClient);
  });
  afterAll(async () => {
    await NearCache.close();
  });
  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('With Redis Cache only', () => {
    test('customerRepository.findOne should be called 1 time only', async () => {
      const customerService = new CustomerService(customerRepository);
      const customerServiceFindOneSpy = jest.spyOn(customerService, 'findOne');

      const customerId = 1;
      await customerService.create(Customer.of(customerId));

      await customerService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(0);

      await customerService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(2);

      // Should not be called again as the data will be retrieved from Redis on the second call.
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);

      expect(nearRedisGetSpy).toHaveBeenCalledTimes(2);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(0);

      await customerService.delete(customerId);
    });
  });

  describe('With both Near Cache and Redis Cache', () => {
    test('customerRepository.findOne should be called 1 time only', async () => {
      const customerNearService = new CustomerNearService(customerRepository);
      const customerNearServiceFindOneSpy = jest.spyOn(customerNearService, 'findOne');

      const customerId = 2;
      await customerNearService.create(Customer.of(customerId));

      await customerNearService.findOne(customerId);
      expect(customerNearServiceFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(1);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(1);

      await customerNearService.findOne(customerId);
      expect(customerNearServiceFindOneSpy).toHaveBeenCalledTimes(2);

      // Should not be called again as the data will be retrieved from Near Cache on the second call.
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);

      // Should not be called again as the data will be retrieved from Near Cache on the second call.
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);

      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);

      expect(nearGetNearSpy).toHaveBeenCalledTimes(2);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(1);

      await customerNearService.delete(customerId);
    });
  });
});
