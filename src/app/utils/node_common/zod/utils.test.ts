import { object, number, string } from 'zod';
import { extractError, extractErrorString } from './utils';

describe('zod/utils', () => {
  const Model = object({ id: number(), email: string().email() });

  it('extracts zod error with path', () => {
    try {
      Model.parse({ id: 123, email: 'ss' });
    } catch (error) {
      const err = extractErrorString(error, false);
      expect(err).toEqual('Invalid email');
    }
  });

  it('extracts zod error with path', () => {
    try {
      Model.parse({});
    } catch (error) {
      const err = extractError(error);
      expect(err).toEqual(['Required at id', 'Required at email']);
    }
  });

  it('serializes object message', () => {
    try {
      throw { id: 123 };
    } catch (error) {
      const err = extractError(error);
      expect(err).toEqual([JSON.stringify({ id: 123 })]);
    }
  });
});
