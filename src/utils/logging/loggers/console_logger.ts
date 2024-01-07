import * as Inscribe from "screeps-inscribe";
import { LEVEL_COLORS, LOGGER, LOG_COLORS, LOG_LEVEL, LOG_STRINGS, TIMESTAMP_COLOR } from "../definitions";

export class CONSOLE_LOGGER implements LOGGER {
  private _blacklist: string[] = [];
  private _init = false;
  private _log_level: LOG_LEVEL = LOG_LEVEL.INFO;

  public blacklist(source: string | string[]): void {
    this._blacklist.push(...source);
  }

  public init(default_level?: LOG_LEVEL, blacklist?: string[]): void {
    if (default_level) this._log_level = default_level;
    if (blacklist) this._blacklist = blacklist;
    this._init = true;
  }

  public get initialized(): boolean {
    return this._init;
  }

  public log(level: LOG_LEVEL, source: string, message: string, ...args: any[]): void {
    if (this._log_level >= level && !this._blacklist.includes(source)) {
      if (global.log_focus && global.log_focus !== source) return;
      const timestamp = Inscribe.time(TIMESTAMP_COLOR);

      const formatted_log_level = Inscribe.color(LOG_STRINGS[level], LEVEL_COLORS[level]);
      const formatted_message = Inscribe.color(`(${source}) ${message}`, LOG_COLORS[level]);

      const parsed_args: any[] = args.map((arg: any) => {
        if (typeof arg === "object") return JSON.stringify(arg);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return arg;
      });

      console.log(
        `[${formatted_log_level} @ ${timestamp}]: ${formatted_message}`,
        ...(parsed_args.length > 0 ? parsed_args : [])
      );
    }
  }

  public set log_level(level: LOG_LEVEL) {
    this._log_level = level;
  }
  public get log_level(): LOG_LEVEL {
    return this._log_level;
  }
}
