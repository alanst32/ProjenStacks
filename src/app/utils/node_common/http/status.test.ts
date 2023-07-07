import { HttpStatus, toHttpStatus } from './status';

describe('http/status', () => {
  describe('toHttpStatus', () => {
    it('gets HttpStatus', () => {
      expect(toHttpStatus(400)).toEqual(HttpStatus.BadRequest);
      expect(toHttpStatus(999)).toEqual(undefined);
    });
  });
});
