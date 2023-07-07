import { ForbiddenError, ApiError, NotFoundError, UnauthorizedError, ValidationError } from './errors';
import { HttpStatus } from '../../http/status';

describe('HTTP Error', () => {
  it('can creates custom HTTP error', () => {
    const httpError = new ApiError(HttpStatus.Error, 'Some error', { data: 'invalid' });
    expect(httpError.status).toEqual(HttpStatus.Error);
    expect(httpError.message).toEqual('Some error');
    expect(httpError.data).toEqual({ data: 'invalid' });

    const httpError2 = new ApiError();
    expect(httpError2.status).toEqual(HttpStatus.Error);
    expect(httpError2.message).toEqual('Internal Server Error');

    expect(() => {
      new ApiError(HttpStatus.OK, 'Some error', { data: 'invalid' });
    }).toThrow(/Cannot have status code less than 400/);
  });

  it('contains HTTP status code and message', () => {
    const validationError = new ValidationError('Missing ID', { data: 123 });
    expect(validationError.status).toEqual(HttpStatus.BadRequest);
    expect(validationError.message).toEqual('Missing ID');

    const notFoundError = new NotFoundError(undefined, { data: 123 });
    expect(notFoundError.status).toEqual(HttpStatus.NotFound);
    expect(notFoundError.message).toEqual('Resource Not Found');

    const unauthorizedError = new UnauthorizedError('User is unauthorised', { data: 123 });
    expect(unauthorizedError.status).toEqual(HttpStatus.Unauthorised);
    expect(unauthorizedError.message).toEqual('User is unauthorised');

    const forbiddenError = new ForbiddenError(undefined, { data: 123 });
    expect(forbiddenError.status).toEqual(HttpStatus.Forbidden);
    expect(forbiddenError.message).toEqual('Forbidden');
  });
});
