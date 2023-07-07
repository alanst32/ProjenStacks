import { Middleware } from './core';
import { ApiEvent, Response } from '../aws/apigateway';
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
