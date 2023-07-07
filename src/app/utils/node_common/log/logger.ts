import { EOL } from 'node:os';
import { JsonMask } from '../json/mask';
import { Serializable } from '../lang/types';

/**
 * Log levels.
 * @enum
 */
export const levels = ['silent', 'metric', 'error', 'warn', 'info', 'debug', 'trace'] as const;

/** @enum */
export type LogLevel = (typeof levels)[number];

/**
 * The method interface that writes logs to the console output.
 * @param data The data to write.
 * @param message The message to write.
 * @typeParam TLogLevel The {@link LogLevel} type. For `metric` log level, a string property called 'name' must be supplied.
 */
export type Writer<TLogLevel extends LogLevel> = (
  data: TLogLevel extends 'metric' ? { name: string; [x: string]: Serializable } : Serializable,
  message?: string
) => void;

const weigh = (level: LogLevel) => levels.indexOf(level);

export type LoggerOptions = {
  /** The log level of the logger. */
  level: LogLevel;

  /** The keywords that the logger will sanitise. */
  sanitised: string[];
};

const initialKeywords = ['password', 'secret', 'x-client-secret', 'x-clientsecret'];

/**
 * Logger utility that logs in JSON format and outputs to process stdout.
 */
export class Logger {
  #opts: LoggerOptions;
  #mask: ReturnType<typeof JsonMask>;
  #ctx: Record<string, Serializable> = {};
  readonly level: LogLevel;

  readonly metric: Writer<'metric'>;
  readonly error: Writer<'error'>;
  readonly warn: Writer<'warn'>;
  readonly info: Writer<'info'>;
  readonly debug: Writer<'debug'>;
  readonly trace: Writer<'trace'>;

  constructor(options?: Partial<LoggerOptions>) {
    this.#opts = { level: 'info', sanitised: initialKeywords, ...options };
    this.#mask = JsonMask(this.#opts.sanitised, { ignoreCase: true });
    this.level = this.#opts.level;

    // log metthods
    this.metric = this.getWriter('metric');
    this.error = this.getWriter('error');
    this.warn = this.getWriter('warn');
    this.info = this.getWriter('info');
    this.debug = this.getWriter('debug');
    this.trace = this.getWriter('trace');
  }

  private getWriter<TLogLevel extends LogLevel>(writeLevel: TLogLevel): Writer<TLogLevel> {
    const isSilent =
      this.#opts.level === 'silent' || writeLevel === 'silent' || weigh(this.#opts.level) < weigh(writeLevel);

    return (data, message) => {
      if (isSilent) return;
      const msg = message ?? (typeof data === 'string' ? data : undefined) ?? (data as { message?: string })?.message;
      const spread = data === msg ? {} : typeof data === 'object' ? data : { value: data };
      const line = { level: writeLevel, ...this.#mask(this.#ctx), ...this.#mask(spread), message: msg };
      process.stdout.write(JSON.stringify(line) + EOL);
    };
  }

  /**
   * Sets the sanitised keywords. This will replace any existing keywords.
   * @param keywords The words to sanitise.
   */
  sanitise(...keywords: string[]) {
    this.#opts.sanitised = keywords;
    this.#mask = JsonMask(this.#opts.sanitised);
  }

  /**
   * Conditional logging based on specified level.
   * @level The log level condition to meet.
   * @data The data to log.
   * @message The optional message to log.
   * @experimental
   * @example
   * ```ts
   * log.when('debug', 'debug message').else('info', 'info message') // When log level is debug, log 'debug message'. Else, log 'info message' on info level.
   * ```
   */
  when(level: LogLevel, data: Serializable, message?: string) {
    return {
      else: (elseLevel: LogLevel, elseData: Serializable, elseMessage?: string) => {
        if (weigh(level) <= weigh(this.#opts.level)) this.getWriter(level)(data, message);
        else this.getWriter(elseLevel)(elseData, elseMessage);
      },
    };
  }

  /**
   * Sets the context for the log instance. Context will be included in the output.
   * @remarks
   * DO NOT set context for values that can change between lambda executions because in warm lambda executions previously set context will still be available in memory. If this is unavoidable then remember to reset the context at the end of execution, i.e. `log.with(undefined, false)`
   * @param context The context object.
   * @param inheritContext Whether to merge with existing context. Default to true.
   * @experimental
   */
  with(context?: Record<string, Serializable>, inheritContext = true): void {
    this.#ctx = inheritContext ? { ...this.#ctx, ...(context || {}) } : context || {};
  }

  /**
   * Creates a child logger instance that inherits the parent options. The context inheritance is optional.
   * @param context The context object.
   * @param inheritContext Inherit context flag - default is `true`.
   */
  child(context: Record<string, Serializable>, inheritContext = true) {
    const child = new Logger(this.#opts);
    child.with(inheritContext ? { ...this.#ctx, ...context } : context);
    return child;
  }
}
