import { PromiseCache } from './cache';
import { sleep } from './utils';

describe('PromiseCache', () => {
  it('caches values by keys', async () => {
    const cache = new PromiseCache('abc', async () => new Date().getTime());
    const result1 = await cache.get('key');
    await sleep(10);
    const result2 = await cache.get('key');
    expect(result2).toBe(result1);
  });

  it('sets cache value', async () => {
    const cache = new PromiseCache('abc', async () => new Date().getTime());
    cache.set('set-test', 1000);
    await expect(cache.get('set-test')).resolves.toEqual(1000);
  });

  it('does not cache when TTL is 0', async () => {
    const cache = new PromiseCache('abc', async () => new Date().getTime(), 0);
    const result1 = await cache.get('key');
    await sleep(10);
    const result2 = await cache.get('key');
    expect(result2).not.toBe(result1);
  });
});
