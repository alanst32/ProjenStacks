import { TTLCache } from '@brokerloop/ttlcache';
import { Mutex } from './mutex';
import { log } from '../log';

/**
 * The function for retrieving the promise result.
 * @param key The key of the result.
 * @typeParam K The key type.
 * @typeParam T The result type.
 */
export type Method<K extends string, T> = (key: K) => Promise<T>;

const toMilis = (minutes: number) => minutes * 60000;

/**
 * Cache used to store results from a promise.
 */
export class PromiseCache<K extends string, T> {
    private cache: TTLCache<string, T>;
    private mutex = new Mutex();

    /**
     * @param name The name of the cache for logging purpose.
     * @param method The promise method that retrieves the result.
     * @param ttlMinutes Number of minutes to store the cache for. The default maximum is one hour although it could be shorter if the lambda experiences a cold start.
     */
    constructor(readonly name: string, private method: Method<K, T>, ttlMinutes?: number) {
        ttlMinutes ??= Number(process.env.CACHE_TTL_MINUTES || 60);
        log.trace({ cacheName: this.name }, `Cache TTL is set to ${ttlMinutes} minutes`);
        this.cache = new TTLCache<string, T>({ ttl: toMilis(ttlMinutes) });
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
    }

    /** Get the promise result by key from cache or retrieve it from the method if it's not already in cache. */
    async get(key: K): Promise<T> {
        return this.mutex.dispatch(async () => {
            let value = this.cache.get(key);
            if (value === undefined) {
                value = await this.method(key);
                this.cache.set(key, value);
                log.trace({ cacheName: this.name }, `Item with key '${key}' added to cache`);
            } else {
                log.trace({ cacheName: this.name }, `Item with key '${key}' returned from cache`);
            }
            return value;
        });
    }

    /** Store a result in the cache by key */
    set(key: string, value: T) {
        this.cache.set(key, value);
    }
}
