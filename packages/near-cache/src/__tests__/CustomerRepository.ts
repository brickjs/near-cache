import { Customer } from './Customer';

export class CustomerRepository {
  customerMap: Map<number, Customer> = new Map();

  create(customer: Customer) {
    if (customer.id && customer.name) {
      if (this.customerMap.has(customer.id)) {
        throw new Error(`Customer id ${customer.id} exists!`);
      } else {
        this.customerMap.set(customer.id, customer);
        return customer;
      }
    }
    throw new Error(`Customer id and name are required!`);
  }

  findOne(customerId: number) {
    return this.customerMap.get(customerId);
  }

  update(customer: Customer) {
    if (customer.id && customer.name) {
      if (!this.customerMap.has(customer.id)) {
        throw new Error(`Customer id ${customer.id} does not exists!`);
      } else {
        this.customerMap.set(customer.id, customer);
        return customer;
      }
    }
    throw new Error(`Customer id and name are required!`);
  }

  delete(customerId: number) {
    if (customerId) {
      if (!this.customerMap.has(customerId)) {
        throw new Error(`Customer id ${customerId} does not exists!`);
      } else {
        const customer = this.customerMap.get(customerId);
        this.customerMap.delete(customerId);
        return customer;
      }
    }
    throw new Error(`Customer id is required!`);
  }
}
