import { HttpStatus } from '../../http';
import { SerializableRecord } from '../../lang';

/**
 * The error type that contains HTTP status code that {@link aws/apigateway/handler!ApiHandler} can use to set the API Gateway response HTTP status code.
 */
export class ApiError extends Error {
  /**
   * @param status The {@link http/status!HttpStatus:type}.
   * @param message The optional message. {@link aws/apigateway/handler!ApiHandler} will use standar HTTP status description if this is not supplied.
   * @param data The optional data to include in this error.
   */
  constructor(readonly status = HttpStatus.Error, message?: string, readonly data?: SerializableRecord) {
    super(message ?? HttpStatus.Error.message);
    if (status.code < 400) throw new Error('Cannot have status code less than 400');
  }
}

/** The {@link ApiError} that contains HTTP 400 Bad Request status. */
export class ValidationError extends ApiError {
  /**
   * @param message The error message.
   * @param data The optional data to include in this error.
   */
  constructor(message?: string, data?: SerializableRecord) {
    super(HttpStatus.BadRequest, message ?? HttpStatus.BadRequest.message, data);
  }
}

/** The {@link ApiError} that contains HTTP 403 Forbidden status. */
export class ForbiddenError extends ApiError {
  /**
   * @param message The error message.
   * @param data The optional data to include in this error.
   */
  constructor(message?: string, data?: SerializableRecord) {
    super(HttpStatus.Forbidden, message ?? HttpStatus.Forbidden.message, data);
  }
}

/** The {@link ApiError} that contains HTTP 404 Not Found status. */
export class NotFoundError extends ApiError {
  /**
   * @param message The error message.
   * @param data The optional data to include in this error.
   */
  constructor(message?: string, data?: SerializableRecord) {
    super(HttpStatus.NotFound, message ?? HttpStatus.NotFound.message, data);
  }
}

/** The {@link ApiError} that contains HTTP 401 Unauthorized status. */
export class UnauthorizedError extends ApiError {
  /**
   * @param message The error message.
   * @param data The optional data to include in this error.
   */
  constructor(message?: string, data?: SerializableRecord) {
    super(HttpStatus.Unauthorised, message ?? HttpStatus.Unauthorised.message, data);
  }
}

/** The {@link ApiError} that contains HTTP 408 Timeout status. */
export class TimeoutError extends ApiError {
  /**
   * @param message The error message.
   * @param data The optional data to include in this error.
   */
  constructor(message?: string, data?: SerializableRecord) {
    super(HttpStatus.Timeout, message ?? HttpStatus.Timeout.message, data);
  }
}
