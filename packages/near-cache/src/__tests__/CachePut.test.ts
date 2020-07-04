import { createRedisCacheClient } from 'near-cache-adapter-redis-3';
import * as NearCache from '../NearCache';
import { Customer } from './Customer';
import { CustomerService } from './CustomerService';
import { CustomerNearService } from './CustomerNearService';
import { CustomerRepository } from './CustomerRepository';

const redisCacheClient = createRedisCacheClient(6379);

describe('CachePut', () => {
  beforeAll(async () => {
    NearCache.addCache('customer', redisCacheClient);
  });
  afterAll(async () => {
    await NearCache.close();
  });
  afterEach(async () => {
    jest.clearAllMocks();
  });

  const customerRepository = new CustomerRepository();
  const customerRepositoryFindOneSpy = jest.spyOn(customerRepository, 'findOne');

  const nearRedisGetSpy = jest.spyOn(NearCache, 'get');
  const nearRedisSetSpy = jest.spyOn(NearCache, 'set');
  const nearGetNearSpy = jest.spyOn(NearCache, 'getNear');
  const nearSetNearSpy = jest.spyOn(NearCache, 'setNear');

  describe('With Redis Cache only', () => {
    test('customerRepository.update should update the cached record', async () => {
      const customerService = new CustomerService(customerRepository);
      const customerServiceFindOneSpy = jest.spyOn(customerService, 'findOne');
      const customerServiceUpdateSpy = jest.spyOn(customerService, 'update');
      const customerRepositoryUpdateSpy = jest.spyOn(customerRepository, 'update');

      const customerId = 21;
      const customer = Customer.of(customerId);
      await customerService.create(customer);

      customer.name = `Customer ${customerId} Updated`;
      await customerService.update(customer);
      expect(customerServiceUpdateSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryUpdateSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(0);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(0);

      await customerService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(1);

      // Not called since the cache has been put
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(0);

      expect(customerServiceUpdateSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryUpdateSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(0);

      await customerService.delete(customerId);
    });
  });

  describe('With both Near Cache and Redis Cache', () => {
    test('customerRepository.update should update the cached record', async () => {
      const customerNearService = new CustomerNearService(customerRepository);
      const customerServiceFindOneSpy = jest.spyOn(customerNearService, 'findOne');
      const customerServiceUpdateSpy = jest.spyOn(customerNearService, 'update');
      const customerRepositoryUpdateSpy = jest.spyOn(customerRepository, 'update');

      const customerId = 22;
      const customer = Customer.of(customerId);
      await customerNearService.create(customer);

      customer.name = `Customer ${customerId} Updated`;
      await customerNearService.update(customer);
      expect(customerServiceUpdateSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryUpdateSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(0);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(1);

      await customerNearService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(1);

      // Not called since the cache has been put
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(0);

      expect(customerServiceUpdateSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryUpdateSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(0); // Not called again since the data is retrieved from near cache
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(1);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(1);

      await customerNearService.delete(customerId);
    });
  });
});
