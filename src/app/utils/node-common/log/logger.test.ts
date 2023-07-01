import { mockProcessStdout } from 'jest-mock-process';
import { Logger } from './logger';

describe('Logger', () => {
  const mockStdout = mockProcessStdout();

  it('logs for levels equal or above current level', () => {
    const log = new Logger({ level: 'error' });
    log.trace('trace');
    log.debug('debug');
    log.info('info');
    log.warn('warn');
    log.error('error');
    log.metric({ name: 'my-metric-name', abc: 'abc' }, 'metric');
    log.error({ id: 123, message: 'abc' });
    log.error(undefined);
    log.error(0, 'test');

    expect(mockStdout).not.toHaveBeenCalledWith('trace');
    expect(mockStdout).not.toHaveBeenCalledWith('debug');
    expect(mockStdout).not.toHaveBeenCalledWith('silent');
    expect(mockStdout).not.toHaveBeenCalledWith('warn');
    expect(mockStdout).toHaveBeenNthCalledWith(1, '{"level":"error","message":"error"}\n');
    expect(mockStdout).toHaveBeenNthCalledWith(
      2,
      '{"level":"metric","name":"my-metric-name","abc":"abc","message":"metric"}\n'
    );
    expect(mockStdout).toHaveBeenNthCalledWith(3, '{"level":"error","id":123,"message":"abc"}\n');
    expect(mockStdout).toHaveBeenNthCalledWith(4, '{"level":"error"}\n');
    expect(mockStdout).toHaveBeenNthCalledWith(5, '{"level":"error","value":0,"message":"test"}\n');
  });

  it('logs WHEN message when log level is in effect', () => {
    const log = new Logger({ level: 'trace' });
    log.when('info', 'a').else('debug', 'b');
    log.when('trace', 'a').else('info', 'b');
    expect(mockStdout).toHaveBeenNthCalledWith(1, '{"level":"info","message":"a"}\n');
    expect(mockStdout).toHaveBeenNthCalledWith(2, '{"level":"trace","message":"a"}\n');
  });

  it('logs ELSE message when log level is not in effect', () => {
    const log = new Logger({ level: 'warn' });
    log.when('info', 'a').else('error', 'b');
    log.when('info', 'a').else('warn', 'b');
    expect(mockStdout).toHaveBeenNthCalledWith(1, '{"level":"error","message":"b"}\n');
    expect(mockStdout).toHaveBeenNthCalledWith(2, '{"level":"warn","message":"b"}\n');
  });

  it('does not log when log level is no in effect with both WHEN and ELSE levels lower', () => {
    const log = new Logger({ level: 'warn' });
    log.when('info', 'a').else('debug', 'b');
    expect(mockStdout).not.toHaveBeenCalled();
  });

  it('logs with no context when none supplied', () => {
    const log = new Logger({ level: 'debug' });

    log.debug('message-1');
    expect(mockStdout).toHaveBeenNthCalledWith(1, '{"level":"debug","message":"message-1"}\n');

    log.debug({ test: 'my-test' });
    expect(mockStdout).toHaveBeenNthCalledWith(2, '{"level":"debug","test":"my-test"}\n');

    log.debug(10, 'test');
    expect(mockStdout).toHaveBeenNthCalledWith(3, '{"level":"debug","value":10,"message":"test"}\n');
  });

  it('adds context to log message', () => {
    const log = new Logger({ level: 'debug' });

    log.with({ program: 'my-program' });
    log.info({ test: 'my-test' }, 'message-1');
    log.info('message-2');

    expect(mockStdout).toHaveBeenNthCalledWith(
      1,
      '{"level":"info","program":"my-program","test":"my-test","message":"message-1"}\n'
    );

    expect(mockStdout).toHaveBeenNthCalledWith(2, '{"level":"info","program":"my-program","message":"message-2"}\n');

    log.with({ other: 'other' }, false);
    log.info('message-3');

    expect(mockStdout).toHaveBeenNthCalledWith(3, '{"level":"info","other":"other","message":"message-3"}\n');
  });

  it('can create child logger and optionally inherit context', () => {
    const log = new Logger({ level: 'info' });

    const lc1 = log.child({ program1: 'program-1' });
    lc1.info('message-1');
    expect(mockStdout).toHaveBeenNthCalledWith(1, '{"level":"info","program1":"program-1","message":"message-1"}\n');

    const lc2 = lc1.child({ program2: 'program-2' }, true);
    lc2.info('message-2');
    expect(mockStdout).toHaveBeenNthCalledWith(
      2,
      '{"level":"info","program1":"program-1","program2":"program-2","message":"message-2"}\n'
    );

    const lc3 = lc2.child({ program3: 'program-3' }, false);
    lc3.info('message-3');
    expect(mockStdout).toHaveBeenNthCalledWith(3, '{"level":"info","program3":"program-3","message":"message-3"}\n');
  });

  it('sanitises content', () => {
    const log = new Logger({ level: 'debug' });
    const lc = log.child({ program: 'my-program' });

    lc.info({ password: '123', other: 'other' }, 'message-1');

    expect(mockStdout).toHaveBeenCalledWith(
      '{"level":"info","program":"my-program","password":"********","other":"other","message":"message-1"}\n'
    );
  });

  it('sets new sanitised keywords', () => {
    const log = new Logger({ level: 'debug' });
    const lc = log.child({ program: 'my-program' });

    lc.sanitise('abc');
    lc.info({ abc: '123', password: 'pass', other: 'other' }, 'message-1');

    expect(mockStdout).toHaveBeenCalledWith(
      '{"level":"info","program":"my-program","abc":"********","password":"pass","other":"other","message":"message-1"}\n'
    );
  });

  it('can handle null values', () => {
    const log = new Logger({ level: 'debug' });

    log.with({ program: 'my-program', blah: undefined });
    log.info({ body: null }, 'message-1');

    expect(mockStdout).toHaveBeenCalledWith(
      '{"level":"info","program":"my-program","body":null,"message":"message-1"}\n'
    );
  });
});
