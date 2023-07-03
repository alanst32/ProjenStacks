import { Middleware } from './core';
import { ApiEvent, ApiError, Response } from '../apigateway';
import { log } from '../log';
import { extractError, isZodError } from '../zod/utils';

/**
 * Create a middleware used to catch handler error and return HTTP response according to the error type.
 */
export const ApiErrorHandler = (): Middleware<ApiEvent, Response> => ({
  onError: error => {
    let response: Response;
    let message = error.message;
    let errors: string[] | undefined;

    if (error instanceof ApiError) {
      response = Response.apiError(error);
    } else if (isZodError(error)) {
      message = 'Failed parsing data';
      errors = extractError(error);
      response = Response.bad({ message, errors });
    } else {
      message ||= 'Unknown error';
      response = Response.error(message);
    }

    log.error({ message, errors, stack: error.stack });
    return response;
  },
});
