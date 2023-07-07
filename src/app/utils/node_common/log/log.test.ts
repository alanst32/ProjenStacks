process.env.NODE_ENV = undefined;

import { mockProcessStdout } from 'jest-mock-process';

import { log } from './log';

describe('log', () => {
  it('logs according to environment log level', () => {
    const mockStdout = mockProcessStdout();

    log.info('info message');
    expect(mockStdout).toHaveBeenNthCalledWith(1, '{"level":"info","message":"info message"}\n');
  });
});
