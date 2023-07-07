import { extractErrorString } from '../zod/utils';

/** Represents a success Result. */
export type Success<T> = { success: true; value: T };

/** Represents a failure Result. */
export type Failure<_T> = { success: false; message: string; error: any };

/** Represents a value encapsulated within the Result wrapper. */
export type Result<T> = Success<T> | Failure<T>;

export namespace Result {
    /**
     * Returns a success Result.
     * @param value The value to wrap.
     * @returns The success result.
     */
    export const success = <T>(value: T): Result<T> => ({ success: true, value });

    /**
     * Returns a failure Result
     * @param error The error object.
     * @returns The failure result.
     */
    export const failure = <T>(error: any): Result<T> => ({
        success: false,
        message: extractErrorString(error),
        error,
    });

    /**
     * Try executing a non-promise function and return the result in a {@link Result:type} wrapper.
     * @param task The task to execute.
     * @returns The result of the attempt.
     * @example
     * ```ts
     * const res = Result.from(() => 10)
     * console.log(res) // { success: true, value: 10 }
     *
     * const errorRes = Result.from(() => {
     *   throw new Error('An error')
     * })
     * console.log(errorRes) // { success: false, message: 'An error' }
     * ```
     */
    export function from<T>(task: () => T): Result<T>;

    /**
     * Try resolving a promise and return the result in a {@link Result:type} wrapper.
     * @param task The task to execute.
     * @returns The result of the attempt.
     * @example
     * ```ts
     * const res = await Result.from(async () => 10)
     * console.log(res) // { success: true, value: 10 }
     * ```
     */
    export function from<T>(task: Promise<T>): Promise<Result<T>>;

    export function from(task: unknown) {
        if (task instanceof Promise) {
            return task.then(res => success(res)).catch(error => failure(error));
        } else {
            try {
                return success((task as Function)());
            } catch (error) {
                return failure(error);
            }
        }
    }
}
