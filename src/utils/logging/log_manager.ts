import { LOGGER, LOG_LEVEL } from "./definitions";
import { CONSOLE_LOGGER } from "./loggers";
import { LOG_INTERFACE } from "./log_interface";

interface SOURCE_LEVEL_OBJECT {
  [name: string]: LOG_LEVEL;
}

/**
 * the manager for all logging
 *
 * @class
 */
export class LOG_MANAGER {
  private _default_level: LOG_LEVEL = LOG_LEVEL.INFO;
  private _log_source_levels: Map<string, LOG_LEVEL> = new Map();
  private _loggers: LOGGER[] = [];

  /**
   * creates an instance of LOG_MANAGER
   *
   * @constructs LOG_MANAGER
   * @param {LOG_LEVEL} default_level the default level to log at
   */
  public constructor(default_level?: LOG_LEVEL) {
    if (default_level) {
      this._default_level = default_level;
    }
    this._loggers.push(new CONSOLE_LOGGER());
  }

  /**
   * passes a log message to all valid outputs
   *
   * @param {LOG_LEVEL} level log level of the message
   * @param {string} source the {@link LOG_INTERFACE} the message came from
   * @param {string} message the message to log
   * @param {...any} args any additional arguments to pass to the logger
   */
  public _log(level: LOG_LEVEL, source: string, message: string, ...args: any[]): void {
    for (const logger of this._loggers) {
      if (!logger.initialized) {
        logger.init(this._default_level);
      }
      if (
        !this._log_source_levels.has(source.toLowerCase()) ||
        (this._log_source_levels.get(source.toLowerCase()) || this._default_level) >= level
      ) {
        logger.log(level, source, message, ...args);
      }
    }
  }
  /**
   * adds a new {@link LOGGER} output
   *
   * @param {LOGGER} logger the logger to add
   */
  public add_logger(logger: LOGGER): void {
    this._loggers.push(logger);
  }

  /**
   * blacklists source(s) from being sent to ANY output
   *
   * @param {string|string[]} source the source(s) to blacklist
   */
  public blacklist_all(source: string | string[]): void {
    for (const logger of this._loggers) {
      logger.blacklist(source);
    }
  }

  /**
   * gets a new {@link LOG_INTERFACE} for a given source
   *
   * @param {string} source the source to get a logger for
   * @returns {LOG_INTERFACE} the logger
   */
  public get_logger(source: string): LOG_INTERFACE {
    return new LOG_INTERFACE(source, this);
  }

  /**
   * manually set log levels for specific sources, used to hide unnecessary debugging
   *
   * @param {SOURCE_LEVEL_OBJECT} levels the map of source string to log level
   */
  public set_source_levels(levels: SOURCE_LEVEL_OBJECT): void {
    for (const [source, level] of Object.entries(levels)) {
      this._log_source_levels.set(source.toLowerCase(), level);
    }
  }
}
