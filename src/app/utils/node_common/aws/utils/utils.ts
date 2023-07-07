import { AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { log } from '../../log';

/** AWS SDK client operation with `.promise()` method. */
export type Operation<T> = { promise: () => Promise<PromiseResult<T, AWSError>> };

/**
 * Allows an AWS SDK client promise method to throw error when there is response error in the result.
 * By default error will not be thrown by the promise method of an AWS SDK client, that may cause errors go undetected.
 * @param operation {@link Operation}
 * @param message The error message to log when the response error does not contain one.
 * @returns The operation with error check wrapped.
 * @example
 * ```ts
 * await withErrorCheck(documentClient.put({ ... }))
 * // Note that we do not call .promise(), the function will call it instead.
 * ```
 */
export const withErrorCheck = async <T>(operation: Operation<T>, message?: string) => {
  const res = await operation.promise();
  if (!res.$response?.error) return res;
  log.error({ message: res.$response.error.message || message || 'Operation failed' });
  throw res.$response.error;
};
