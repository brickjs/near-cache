import { createRedisCacheClient } from 'near-cache-adapter-redis-3';
import * as NearCache from '../NearCache';
import { Customer } from './Customer';
import { CustomerService } from './CustomerService';
import { CustomerNearService } from './CustomerNearService';
import { CustomerRepository } from './CustomerRepository';

const redisCacheClient = createRedisCacheClient(6379);

describe('CacheEvict', () => {
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
  const nearRedisDelSpy = jest.spyOn(NearCache, 'del');
  const nearGetNearSpy = jest.spyOn(NearCache, 'getNear');
  const nearSetNearSpy = jest.spyOn(NearCache, 'setNear');
  const nearDelNearSpy = jest.spyOn(NearCache, 'delNear');

  describe('With Redis Cache only', () => {
    test('customerRepository.delete should remove the cached record', async () => {
      const customerService = new CustomerService(customerRepository);
      const customerServiceFindOneSpy = jest.spyOn(customerService, 'findOne');
      const customerServiceDeleteSpy = jest.spyOn(customerService, 'delete');
      const customerRepositoryDeleteSpy = jest.spyOn(customerRepository, 'delete');

      const customerId = 11;
      await customerService.create(Customer.of(customerId));

      await customerService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerServiceDeleteSpy).toHaveBeenCalledTimes(0);
      expect(customerRepositoryDeleteSpy).toHaveBeenCalledTimes(0);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisDelSpy).toHaveBeenCalledTimes(0);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearDelNearSpy).toHaveBeenCalledTimes(0);

      await customerService.delete(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerServiceDeleteSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryDeleteSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisDelSpy).toHaveBeenCalledTimes(1);

      await customerService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(2);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(2);
      expect(customerServiceDeleteSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryDeleteSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(2);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisDelSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(0);
      expect(nearDelNearSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('With both Near Cache and Redis Cache', () => {
    test('customerRepository.delete should remove the cached record', async () => {
      const customerNearService = new CustomerNearService(customerRepository);
      const customerServiceFindOneSpy = jest.spyOn(customerNearService, 'findOne');
      const customerServiceDeleteSpy = jest.spyOn(customerNearService, 'delete');
      const customerRepositoryDeleteSpy = jest.spyOn(customerRepository, 'delete');

      const customerId = 12;
      await customerNearService.create(Customer.of(customerId));

      await customerNearService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerServiceDeleteSpy).toHaveBeenCalledTimes(0);
      expect(customerRepositoryDeleteSpy).toHaveBeenCalledTimes(0);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisDelSpy).toHaveBeenCalledTimes(0);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(1);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(1);
      expect(nearDelNearSpy).toHaveBeenCalledTimes(0);

      await customerNearService.delete(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(1);
      expect(customerServiceDeleteSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryDeleteSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisDelSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(1);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(1);
      expect(nearDelNearSpy).toHaveBeenCalledTimes(1);

      await customerNearService.findOne(customerId);
      expect(customerServiceFindOneSpy).toHaveBeenCalledTimes(2);
      expect(customerRepositoryFindOneSpy).toHaveBeenCalledTimes(2);
      expect(customerServiceDeleteSpy).toHaveBeenCalledTimes(1);
      expect(customerRepositoryDeleteSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisGetSpy).toHaveBeenCalledTimes(2);
      expect(nearRedisSetSpy).toHaveBeenCalledTimes(1);
      expect(nearRedisDelSpy).toHaveBeenCalledTimes(1);
      expect(nearGetNearSpy).toHaveBeenCalledTimes(2);
      expect(nearSetNearSpy).toHaveBeenCalledTimes(1);
      expect(nearDelNearSpy).toHaveBeenCalledTimes(1);
    });
  });
});
