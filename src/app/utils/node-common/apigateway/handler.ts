import { Response } from './response';
import { ApiEvent } from './types';
import { log } from '../log';
import { Middleware, WithMiddleware } from '../middlewares';
import { ApiErrorHandler } from '../middlewares/api-error-handler';
import { ApiHeaderNormalizer } from '../middlewares/api-header-normalizer';
import { ApiJsonBodyParser } from '../middlewares/api-json-body-parser';
import { ApiLogger } from '../middlewares/api-logger';

export type Option = {
  /** Extra middlewares to add. */
  middlewares: Middleware<ApiEvent, Response>[];
};

/**
 * The handler type that handles {@link aws/apigateway/types!ApiEvent} event.
 */
export type ApiHandler = (event: ApiEvent) => Response | Promise<Response>;

/**
 * Wraps the API Gateway handler with default middlewares such as ApiHeaderNormalizer, ApiJsonBodyParser, ApiErrorHandler, and ApiLogger.
 * Additional middlwares can also be included in the {@link Option} parameter
 * @param handler The API Gateway handler to wrap.
 * @param option The Option object.
 * @returns API Gateway handler wrapped in middlewares.
 */
export const ApiHandler = (handler: ApiHandler, option?: Partial<Option>): ApiHandler => {
  return WithMiddleware(handler).use(
    ApiHeaderNormalizer(),
    ApiJsonBodyParser(),
    ...(option?.middlewares || []),
    ApiErrorHandler(),
    ApiLogger(log)
  );
};
