/* eslint-disable import/order */
import { mockGetSecretValue } from './secret-manager.mock';
import { CachedSecretProvider } from './cached-secrets';

describe('CachedSecretProvider', () => {
  const sp = CachedSecretProvider();

  it('gets secret and caches it', async () => {
    let counter = 0;
    mockGetSecretValue.mockImplementation(() => {
      counter++;
      return Promise.resolve({ SecretString: JSON.stringify({ counter }), $response: {} });
    });

    await expect(sp.getRawSecret('pass')).resolves.toEqual('{"counter":1}');
    await expect(sp.getRawSecret('pass')).resolves.toEqual('{"counter":1}');
    await expect(sp.getRawSecret('pass')).resolves.toEqual('{"counter":1}');

    await expect(sp.getSecret('pass')).resolves.toEqual({ counter: 1 });
    await expect(sp.getSecret('pass')).resolves.toEqual({ counter: 1 });
    await expect(sp.getSecret('pass')).resolves.toEqual({ counter: 1 });
  });
});
