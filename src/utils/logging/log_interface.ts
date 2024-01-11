import { LOG_LEVEL } from "./definitions";
import { LOG_MANAGER } from "./log_manager";

/**
 * the interface for logging, where messages are actually passed to
 *
 * @class
 */
export class LOG_INTERFACE {
  private _manager: LOG_MANAGER;
  private _source: string;

  /**
   * creates an instance of LOG_INTERFACE
   *
   * @constructs LOG_INTERFACE
   * @param {string} source the source of the log messages
   * @param {LOG_MANAGER} manager the log manager that created this interface
   */
  public constructor(source: string, manager: LOG_MANAGER) {
    this._source = source;
    this._manager = manager;
  }
  /**
   * send a debug message
   *
   * @param {string} message the message to log
   * @param {...any} args any additional arguments to pass to the logger
   */
  public debug(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.DEBUG, this._source, message, ...args);
  }
  /**
   * send an error message
   *
   * @param {string} message the message to log
   * @param {...any} args any additional arguments to pass to the logger
   */
  public error(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.ERROR, this._source, message, ...args);
  }
  /**
   * send an info message
   *
   * @param {string} message the message to log
   * @param {...any} args any additional arguments to pass to the logger
   */
  public info(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.INFO, this._source, message, ...args);
  }
  /**
   * send a verbose (trace) message
   *
   * @param {string} message the message to log
   * @param {...any} args any additional arguments to pass to the logger
   */
  public verbose(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.VERBOSE, this._source, message, ...args);
  }
  /**
   * send a warning message
   *
   * @param {string} message the message to log
   * @param {...any} args any additional arguments to pass to the logger
   */
  public warn(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.WARN, this._source, message, ...args);
  }
}
