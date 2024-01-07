import { LOGGER, LOG_LEVEL } from "./definitions";
import { CONSOLE_LOGGER } from "./loggers";
import { LOG_INTERFACE } from "./log_interface";

export class LOG_MANAGER {
  private _default_level: LOG_LEVEL = LOG_LEVEL.INFO;
  private _loggers: LOGGER[] = [];

  public constructor(default_level?: LOG_LEVEL) {
    if (default_level) this._default_level = default_level;
    this._loggers.push(new CONSOLE_LOGGER());
  }

  public _log(level: LOG_LEVEL, source: string, message: string, ...args: any[]): void {
    for (const logger of this._loggers) {
      if (!logger.initialized) logger.init(this._default_level);
      logger.log(level, source, message, ...args);
    }
  }
  public add_logger(logger: LOGGER): void {
    this._loggers.push(logger);
  }

  public blacklist_all(source: string | string[]): void {
    for (const logger of this._loggers) {
      logger.blacklist(source);
    }
  }

  public get_logger(source: string): LOG_INTERFACE {
    return new LOG_INTERFACE(source, this);
  }
}
