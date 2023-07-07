import { Result } from './result';

describe('Result', () => {
  it('wraps return value in result', () => {
    const a = Result.from(() => 3);
    expect(a.success).toBe(true);
    a.success && expect(a.value).toBe(3);
  });

  it('wraps return promise value in result', async () => {
    const a = await Result.from(Promise.resolve(3));
    expect(a.success).toBe(true);
    a.success && expect(a.value).toBe(3);
  });

  it('returns failure result', async () => {
    const a = Result.from(() => {
      throw new Error('blah');
    });

    expect(a.success).toBe(false);
    !a.success && expect(a.message).toBe('blah');
  });

  it('returns promise failure result', async () => {
    const a = await Result.from(Promise.reject('error'));
    expect(a.success).toBe(false);
    !a.success && expect(a.error).toBe('error');
  });
});
