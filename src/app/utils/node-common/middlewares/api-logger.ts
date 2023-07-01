import { Middleware } from './core';
import { Response } from '@/app/utils/aws/apigateway/response';
import { ApiEvent } from '@/app/utils/aws/apigateway/types';
import { Logger } from '@/app/utils/log/logger';

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
