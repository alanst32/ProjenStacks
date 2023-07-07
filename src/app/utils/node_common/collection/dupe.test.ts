import { dupe, uniq } from './dupe';

describe('uniq', () => {
  it('returns uniq items', () => {
    expect(uniq([1, 2, 1, 4, 1, 3])).toEqual([1, 2, 4, 3]);
  });
});

describe('dupe', () => {
  it('finds duplicates', () => {
    expect(dupe([])).toEqual([]);
    expect(dupe([1, 2, 3, 4, 5])).toEqual([]);
    expect(dupe([1, 1, 1, 2, 3, 4, 5, 5])).toEqual([1, 5]);
  });
});
