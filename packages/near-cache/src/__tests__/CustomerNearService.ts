import { Cacheable } from '../Cacheable';
import { CacheEvict } from '../CacheEvict';
import { CachePut } from '../CachePut';
import { Customer } from './Customer';
import { CustomerRepository } from './CustomerRepository';

export class CustomerNearService {
  customerRepository: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  @Cacheable({ cacheName: 'customer', maxNearAge: 3600000 })
  findOne(customerId: number) {
    return this.customerRepository.findOne(customerId);
  }

  create(customer: Customer) {
    return this.customerRepository.create(customer);
  }

  @CacheEvict({ cacheName: 'customer' })
  delete(customerId: number) {
    return this.customerRepository.delete(customerId);
  }

  @CachePut({ cacheName: 'customer', maxNearAge: 3600000, key: (args) => args[0].id })
  update(customer: Customer) {
    return this.customerRepository.update(customer);
  }
}
