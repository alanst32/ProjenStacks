import { ZodError } from 'zod';

/**
 * Check whether an object is an instance of ZodError.
 * @param error The object to check
 * @returns True if the object is an instance of ZodError.
 */
export const isZodError = (error: any): error is ZodError => {
    return error.issues && typeof error.flatten === 'function';
};

/**
 * Extract the error message(s) of an error object.
 * @param error The error object
 * @param includePath Whether to include the zod error path in error message.
 * @returns The error messages.
 */
export const extractError = (error: any, includePath = true): string[] => {
    if (typeof error === 'string') {
        return [error];
    } else if (isZodError(error)) {
        return error.issues.map(issue => {
            const path = includePath ? issue.path.join('.') : undefined;
            return `${issue.message} ${path ? `at ${path}` : ''}`.trim();
        });
    } else if (error.message) {
        return [error.message];
    }

    return [JSON.stringify(error)];
};

/**
 * Similar to {@link extractError} but returns the error messages in a string joined with semicolons.
 * @param error The error object
 * @param includePath Whether to include the zod error path in error message.
 * @returns The error messages in string.
 */
export const extractErrorString = (error: any, includePath = true): string => {
    const messages = extractError(error, includePath);
    return messages.join('; ');
};
