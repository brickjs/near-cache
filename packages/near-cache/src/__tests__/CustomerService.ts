import { Cacheable } from '../Cacheable';
import { CacheEvict } from '../CacheEvict';
import { CachePut } from '../CachePut';
import { Customer } from './Customer';
import { CustomerRepository } from './CustomerRepository';

export class CustomerService {
  customerRepository: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  @Cacheable({ cacheName: 'customer' })
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

  @CachePut({ cacheName: 'customer', key: (args) => args[0].id })
  update(customer: Customer) {
    return this.customerRepository.update(customer);
  }
}
