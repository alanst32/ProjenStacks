import { getTimeToLive } from './utils';

describe('utils/aws/dynamo/helpers', () => {
  describe('getTimeToLive', () => {
    it('returns correct time to live seconds', () => {
      const now = Math.floor(new Date().getTime() / 1000);
      const ttl = getTimeToLive(10);
      expect(Math.abs(ttl - now)).toBe(600);
    });

    it('returns correct time to live seconds with NaN input', async () => {
      const now = Math.floor(new Date().getTime() / 1000);
      const ttl = getTimeToLive(NaN);
      expect(Math.abs(ttl - now)).toBe(1800);
    });
  });
});
