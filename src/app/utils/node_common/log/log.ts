import { Logger, LogLevel } from './logger';

const currentLevel = (): LogLevel => {
  return process.env.NODE_ENV === 'test' ? 'silent' : ((process.env.LOG_LEVEL || 'info').toLowerCase() as LogLevel);
};

/**
 * The log instance of the {@link Logger} class.
 * The level is obtained from the `LOG_LEVEL` environment variable which defaults to `info` if not available.
 * When running in jest the log level will be set to `silent`.
 */
export const log = new Logger({ level: currentLevel() });
