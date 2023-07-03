import { Middleware } from './core';
import { UnauthorizedError, Response, ApiEvent } from '../apigateway';
import { Result } from '../lang/result';
import { log } from '../log';

export type Props = {
  /**
   * The function used to fetch the client and secret that will be used to validate the request.
   * @param clientId The client ID.
   */
  getClientSecret: (clientId: string) => Promise<string>;
};

/**
 * Create a middleware used to authenticate a request using client ID/secret.
 * @param props {@link Props}
 * @returns
 */
export const ApiClientSecretAuthorizer = (props: Props): Middleware<ApiEvent, Response> => ({
  before: async event => {
    const clientId = event.headers?.['x-client-id'];
    const clientSecret = event.headers?.['x-client-secret'];

    if (!clientId || !clientSecret) {
      throw new UnauthorizedError('Missing or incomplete credentials');
    }

    const res = await Result.from(props.getClientSecret(clientId));

    if (!res.success || !res.value || clientSecret !== res.value) {
      throw new UnauthorizedError('Invalid credentials');
    }

    log.trace('Credentials OK');
    return event;
  },
});
