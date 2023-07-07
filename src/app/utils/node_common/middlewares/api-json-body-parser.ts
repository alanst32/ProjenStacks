import { Middleware } from './core';
import { ApiEvent, Response, ValidationError } from '../aws/apigateway';
import { Result } from '../lang';

/**
 * Create a middleware used to parse the incoming JSON string in the body into an object.
 * Parsing applies only to the body with the `application/json` content type - other MIME type will be ignored.
 */
export const ApiJsonBodyParser = (): Middleware<ApiEvent, Response> => ({
  before: event => {
    const entries = Object.entries(event.headers || {});
    const contentType = entries.find(e => /content-type/i.test(e[0]))?.[1];

    if (/application\/json/i.test(contentType || '')) {
      event.rawBody = event.body;
      const res = Result.from(() => JSON.parse(event.body));
      if (!res.success) throw new ValidationError(res.error.message);
      event.body = res.value;
    }
    return event;
  },
});
