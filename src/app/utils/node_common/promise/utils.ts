import { TimeoutError } from '../aws/apigateway/errors';

/**
 * Waits for an amount of time in milliseconds.
 * @param ms Time to sleep in milliseconds
 */
export const sleep = (ms = 50): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
};

/**
 * Creates a promise-based timeout error.
 * @param message The timeout error message
 * @param seconds Time to wait in milliseconds.
 */
export const timeout = (message: string, ms = 50) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError(`${message} (after ${ms}ms)`)), ms);
  });
};
