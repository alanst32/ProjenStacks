import { Middleware } from './core';
import { Response } from '../aws/apigateway/response';
import { ApiEvent } from '../aws/apigateway/types';
import { toLowerCasedKey } from '../lang/record';

/**
 * Create a middleware used to normalise (lower case) event headers.
 */
export const ApiHeaderNormalizer = (): Middleware<ApiEvent, Response> => ({
  before: event => {
    event.headers = toLowerCasedKey(event.headers);
    event.multiValueHeaders = toLowerCasedKey(event.multiValueHeaders);
    return event;
  },
});
