# near-cache

<p align="center">
    <a href="https://github.com/brickjs/near-cache/actions?query=workflow%3A%22CI+Build+Test%22">
      <img src="https://github.com/brickjs/near-cache/workflows/CI%20Build%20Test/badge.svg?branch=master" />
    </a>
    <a href="https://codecov.io/gh/brickjs/near-cache">
      <img src="https://codecov.io/gh/brickjs/near-cache/branch/master/graph/badge.svg" />
    </a>
</p>

Decorator to cache returned value of any ES6 class methods with Redis and in server memory.

In server memory acts as the near cache to store data which are accessed very frequently.

## Installation

```
npm install near-cache --save
```

Depending on your redis version, install the correct adapter.
> Only redis@3 is supported currently.

```
npm install near-cache-adapter-redis-3 --save
```

## Concept

### Cache Name
`cacheName` represents a domain or a table name.
If you are caching a method to load a customer record, you could use `customer` as the `cacheName`.

### Cache Key
`cacheKey` represent unique arguments to load one or more domains or table records. 
To cache the data of `customer` with id 1, you could use `1` as the cache key.

Thus, a combination of `cacheName:cacheKey` is a unique key to retrieve a cached record.

### Near Cache

In a distributed system, remote operations, including accesses to Redis cache, have relatively high latencies. 
Near cache (in server memory cache) will reduce both the remote server and Redis load.

Data which will not be updated within a fixed interval will benefit most from the near cache.
Hourly weather data is a good example.

## Usage

As soon as possible, add a new Cache in your code.

```javascript
import { addCache } from 'near-cache';
import { createRedisCacheClient } from 'near-cache-adapter-redis-3';
const redisCacheClient = createRedisCacheClient(6379);
addCache('customer', redisCacheClient);
```

Apply the `@Cacheable` decorator to a method.

```javascript
import { Cacheable } from 'near-cache';

export class CustomerService {

  @Cacheable({cacheName: 'customer', maxAge: 3600, maxNearAge: 60 * 1000})
  findOne(customerId) {
    return new Customer(customerId);
  }
}
```

The setup above will automatically cache the returned value from `findOne` in both Redis and in server memory.
When the `findOne` is called again within 1 minute with the same argument values  do not change, the value will be returned from the memory.
Otherwise, the value will be returned from Redis.

When the customer data is updated or deleted, the cached stale data must be removed. The `@CacheEvict` annotation is used to remove the stale or deleted data.

 ```javascript
 import { CacheEvict } from 'near-cache';
 
 export class NearRedisCacheableDemo {
 
   @CacheEvict({cacheName: 'customer', key: (args) => args[0].id})
   update(customer) {
     return customer;
   }
 }
 ```

After the update operation, `@CacheEvict` annotation will remove the cached customer data.
The `key` parameter accepts a function in order to generate the same `cacheKey` value when the cached customer data is created initially.
The `args` is the [arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments) of the decorated function.

The examples here assume that the `customer` object has the `id` property which holds the `customerId` value. 

Alternatively, to prevent too many data evictions, `@CachePut` annotation can be used to update the cached data instead of evicting it.

 ```javascript
 import { CachePut } from 'near-cache';
 
 export class NearRedisCacheableDemo {
 
   @CachePut({cacheName: 'customer', maxAge: 3600, maxNearAge: 60 * 1000, key: (args) => args[0].id})
   update(customer) {
     return customer;
   }
 }
 ```
