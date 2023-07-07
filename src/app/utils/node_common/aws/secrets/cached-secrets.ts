import { SecretsManager } from 'aws-sdk';
import { EMPTY_STRING } from '../../lang';
import { PromiseCache } from '../../promise/cache';
import { withErrorCheck } from '../utils';

/**
 * SecretProvider type interface to be implemented.
 */
export type SecretProvider = {
    /**
     * Gets secret with type casting.
     * @param key The secret ID or name.
     * @returns The type-cast secret.
     */
    getSecret: <T>(key: string) => Promise<T>;

    /**
     * Gets raw secret in string.
     * @param key The secret ID or name.
     * @returns The secret string.
     */
    getRawSecret: (key: string) => Promise<string>;
};

/**
 * Implementation of {@link SecretProvider} with caching.
 * The cached object will be stored for a max of one hour before being discarded.
 * @returns Cached {@link SecretProvider} implementation.
 */
export const CachedSecretProvider = (): SecretProvider => {
    const sm = new SecretsManager();

    const cache = new PromiseCache('secret-provider-cache', async key => {
        const result = await withErrorCheck(sm.getSecretValue({ SecretId: key }));
        return result.SecretString || EMPTY_STRING;
    });

    const getSecret = async <T>(key: string): Promise<T> => {
        const raw = await cache.get(key);
        return JSON.parse(raw) as T;
    };

    return { getSecret, getRawSecret: cache.get };
};
