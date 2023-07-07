import { z } from 'zod';

export const nonBlankString = (min = 1, message?: string) => {
    if (min < 1) throw new Error('Non-blank string must have at least 1 character');
    return z.string().refine(val => val.trim().length >= min, message);
};
