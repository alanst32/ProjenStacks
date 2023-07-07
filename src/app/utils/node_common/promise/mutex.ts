/**
 * Limits access to in-flight promise from multiple access.
 * Using Mutex, all requests awaiting the same promise will receive the same result.
 */
export class Mutex {
  private mutex = Promise.resolve();

  /**
   * Lock the access to a promise.
   * @returns The unlock method
   */
  lock(): PromiseLike<() => void> {
    let begin: (unlock: () => void) => void = _unlock => void 0;

    this.mutex = this.mutex.then(() => new Promise(begin));

    return new Promise(res => {
      begin = res;
    });
  }

  /**
   * Auto-lock the access to a promise function. The function will be unlocked once the promise resolves.
   * @param fn The promise function.
   * @returns The promise result.
   */
  async dispatch<T>(fn: (() => PromiseLike<T>) | (() => T)): Promise<T> {
    const unlock = await this.lock();
    try {
      return await Promise.resolve(fn());
    } finally {
      unlock();
    }
  }
}
