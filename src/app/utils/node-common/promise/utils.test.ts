import { sleep, timeout } from './utils';

describe('promise/utils', () => {
  it('waits for sleep', async () => {
    jest.useFakeTimers();
    const s = sleep();
    jest.advanceTimersByTime(100);
    await expect(s).resolves.toBe(void 0);
    jest.useRealTimers();
  });

  it('sleeps and throws timeout error', async () => {
    await expect(async () => {
      await Promise.race([
        timeout('Request timed out!'),
        (async () => {
          await sleep(200);
          return Promise.resolve();
        })(),
      ]);
    }).rejects.toThrow('Request timed out! (after 50ms)');
  });
});
