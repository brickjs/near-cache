export class Customer {
  id?: number;

  name?: string;

  static of(customerId: number) {
    const customer = new Customer();
    customer.id = customerId;
    customer.name = `Customer ${customerId}`;
    return customer;
  }
}
