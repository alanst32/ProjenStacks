import { Middleware } from './core';
import { ApiEvent, Response } from '../apigateway';
import { Logger } from '../log/logger';

/**
 * Create a middleware used to log the ApiEvent and the Response.
 */
export const ApiLogger = (log: Logger): Middleware<ApiEvent, Response> => ({
  before: event => {
    log.debug({ event }, 'HTTP request');
    return event;
  },
  after: result => {
    const { body, ...rest } = result;
    log.when('debug', { response: result }, 'HTTP response').else('info', { response: rest }, 'HTTP response');
    return result;
  },
});
