import * as Inscribe from "screeps-inscribe";
import { LEVEL_COLORS, LOGGER, LOG_COLORS, LOG_LEVEL, LOG_STRINGS, TIMESTAMP_COLOR } from "../definitions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { LOG_INTERFACE } from "../log_interface";

/**
 * a logger that outputs to the console
 *
 * @class
 */
export class CONSOLE_LOGGER implements LOGGER {
  private _blacklist: string[] = [];
  private _init = false;
  private _log_level: LOG_LEVEL = LOG_LEVEL.INFO;

  /**
   * creates an instance of CONSOLE_LOGGER
   *
   * @constructs CONSOLE_LOGGER
   * @param {string|string[]} blacklist the source(s) to blacklist
   */
  public blacklist(blacklist: string | string[]): void {
    this._blacklist.push(...blacklist);
  }

  /**
   * initializes the logger
   *
   * @param {LOG_LEVEL} default_level optional, default log level
   */
  public init(default_level?: LOG_LEVEL): void {
    if (default_level) {
      this._log_level = default_level;
    }
    this._init = true;
  }

  /**
   * whether or not the logger has been initialized
   *
   * @returns {boolean} true if the logger has been initialized
   */
  public get initialized(): boolean {
    return this._init;
  }

  /**
   * sends a log message to the console
   *
   * @param {LOG_LEVEL} level log level of the message
   * @param {string} source the {@link LOG_INTERFACE} the message came from
   * @param {string} message the message to log
   * @param {...any} args any additional arguments to pass to the logger
   */
  public log(level: LOG_LEVEL, source: string, message: string, ...args: any[]): void {
    if (this._log_level >= level && !this._blacklist.includes(source)) {
      if (global.log_focus && global.log_focus !== source) {
        return;
      }
      const timestamp = Inscribe.time(TIMESTAMP_COLOR);

      const formatted_log_level = Inscribe.color(LOG_STRINGS[level], LEVEL_COLORS[level]);
      const formatted_message = Inscribe.color(`(${source}) ${message}`, LOG_COLORS[level]);

      const parsed_args: any[] = args.map((arg: any) => {
        if (typeof arg === "object") {
          return JSON.stringify(arg);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return arg;
      });

      console.log(
        `[${formatted_log_level} @ ${timestamp}]: ${formatted_message}`,
        ...(parsed_args.length > 0 ? parsed_args : [])
      );
    }
  }

  /**
   * sets the log level
   *
   * @param {LOG_LEVEL} level the new log level
   */
  public set log_level(level: LOG_LEVEL) {
    this._log_level = level;
  }
  /**
   * gets the current log level
   *
   * @returns {LOG_LEVEL} the current log level
   */
  public get log_level(): LOG_LEVEL {
    return this._log_level;
  }
}
