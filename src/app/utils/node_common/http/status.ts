/**
 * Represents an HTTP status.
 */
export type HttpStatus = {
  /** The HTTP status code */
  code: number;

  /** The HTTP status default message. */
  message: string;
};

/** HTTP status name. */
export type HttpStatusName =
  | 'OK'
  | 'Created'
  | 'Accepted'
  | 'SeeOther'
  | 'BadRequest'
  | 'Forbidden'
  | 'NotFound'
  | 'Unauthorised'
  | 'Timeout'
  | 'Error'
  | 'NotAllowed';

/**
 * The {@link HttpStatus:type} record type for commonly used HTTP status.
 * @label RECORD
 */
export const HttpStatus: Record<HttpStatusName, HttpStatus> = {
  OK: { code: 200, message: 'OK' },
  Created: { code: 201, message: 'Created' },
  Accepted: { code: 202, message: 'Accepted' },
  SeeOther: { code: 303, message: 'See Other' },
  BadRequest: { code: 400, message: 'Bad Request' },
  Unauthorised: { code: 401, message: 'Unauthorised' },
  NotFound: { code: 404, message: 'Resource Not Found' },
  Forbidden: { code: 403, message: 'Forbidden' },
  Timeout: { code: 408, message: 'Request Timeout' },
  Error: { code: 500, message: 'Internal Server Error' },
  NotAllowed: { code: 405, message: 'Method Not Allowed' },
};

/**
 * Converts Http status code to {@link HttpStatus:type}.
 * @param code The HTTP status code
 * @returns The {@link HttpStatus:type} value.
 */
export const toHttpStatus = (code: number) => {
  return Object.values(HttpStatus).find(val => val.code === code);
};
