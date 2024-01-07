import { LOG_LEVEL } from "./definitions";
import { LOG_MANAGER } from "./log_manager";

export class LOG_INTERFACE {
  private _manager: LOG_MANAGER;
  private _source: string;

  public constructor(source: string, manager: LOG_MANAGER) {
    this._source = source;
    this._manager = manager;
  }
  public debug(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.DEBUG, this._source, message, ...args);
  }
  public error(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.ERROR, this._source, message, ...args);
  }
  public info(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.INFO, this._source, message, ...args);
  }
  public verbose(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.VERBOSE, this._source, message, ...args);
  }
  public warn(message: string, ...args: any[]): void {
    this._manager._log(LOG_LEVEL.WARN, this._source, message, ...args);
  }
}
