import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiError } from './errors';
import { HttpStatus } from '../http';
import { Serializable } from '../lang';
import { Result } from '../lang/result';

export type Message = Serializable;
export type LocationMessage = { location: string; [x: string]: Serializable };
export type Response = APIGatewayProxyResult;

const defaultHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': process.env.ALLOW_ORIGIN || '*',
  'Content-Type': 'application/json',
};

const locationStatus = [HttpStatus.Created, HttpStatus.SeeOther];

const Responder = <TMessage extends Message>(status: HttpStatus) => {
  return (message?: TMessage, customHeaders?: Record<string, string>): Response => {
    const reason = message || status.message;
    const content = typeof reason === 'string' ? { message: reason } : reason;
    const headers = { ...defaultHeaders, ...customHeaders };

    const locationMessage = content as LocationMessage;
    if (locationStatus.includes(status) && Result.from(() => new URL(locationMessage.location)).success) {
      headers.Location = locationMessage.location;
    }

    return { headers, statusCode: status.code, body: JSON.stringify(content) };
  };
};

/**
 * The helper that returns API Gateway response with Http status code and optional custom headers.
 */
export const Response = {
  ok: Responder(HttpStatus.OK),
  accepted: Responder(HttpStatus.Accepted),
  created: Responder<LocationMessage>(HttpStatus.Created),
  seeOther: Responder<LocationMessage>(HttpStatus.SeeOther),
  notFound: Responder(HttpStatus.NotFound),
  bad: Responder(HttpStatus.BadRequest),
  forbidden: Responder(HttpStatus.Forbidden),
  unauthorized: Responder(HttpStatus.Unauthorised),
  error: Responder(HttpStatus.Error),
  apiError: (error: ApiError) => Responder(error.status)({ message: error.message, ...error.data }),
};
