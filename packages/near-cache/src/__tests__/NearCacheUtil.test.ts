import { createCacheKey } from '../NearCacheUtil';

describe('NearCacheUtil', () => {
  describe('createCacheKey', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const func = function (args1?: any, args2?: any) {
      // eslint-disable-next-line prefer-rest-params
      return createCacheKey(arguments);
    };

    test('undefined', async () => {
      expect(func(undefined)).toBe('undefined');
      expect(func()).toBe('');
    });
    test('null', async () => {
      expect(func(null)).toBe('null');
    });
    test('number', async () => {
      expect(func(123)).toBe('123');
    });
    test('string', async () => {
      expect(func('hello')).toBe('hello');
    });
    test('boolean', async () => {
      expect(func(true)).toBe('true');
      expect(func(false)).toBe('false');
    });
    test('multiple arguments', async () => {
      expect(func(1, 'test')).toBe('eyIwIjoxLCIxIjoidGVzdCJ9'); // {"0":1,"1":"test"}
      expect(func('test', 1)).toBe('eyIwIjoidGVzdCIsIjEiOjF9'); // {"0":"test","1":1}
    });
    test('object', async () => {
      expect(func({ a: 1, b: 'test' })).toBe('eyIwIjp7ImEiOjEsImIiOiJ0ZXN0In19'); // {"0":{"a":1,"b":"test"}}
      expect(func({ b: 'test', a: 1 })).toBe('eyIwIjp7ImEiOjEsImIiOiJ0ZXN0In19'); // {"0":{"a":1,"b":"test"}}
    });
  });
});
