import { LOG_INTERFACE } from "./log_interface";
import { LOG_MANAGER } from "./log_manager";

export enum LOG_LEVEL {
  ERROR,
  WARN,
  INFO,
  VERBOSE,
  DEBUG
}

export interface LOGGER {
  blacklist(source: string | string[]): void;
  init(default_level?: LOG_LEVEL): void;
  get initialized(): boolean;

  log(level: LOG_LEVEL, message: string, source: string, ...args: any[]): void;
  set log_level(level: LOG_LEVEL);
  get log_level(): LOG_LEVEL;
}

export const TIMESTAMP_COLOR = "#5f8f8f";

export const LEVEL_COLORS = {
  [LOG_LEVEL.ERROR]: "#ff0000",
  [LOG_LEVEL.WARN]: "#ffff00",
  [LOG_LEVEL.INFO]: "#ffffff",
  [LOG_LEVEL.VERBOSE]: "#00ffff",
  [LOG_LEVEL.DEBUG]: "#0000ff"
};
export const LOG_COLORS = {
  [LOG_LEVEL.ERROR]: "#cc0000",
  [LOG_LEVEL.WARN]: "#cc7700",
  [LOG_LEVEL.INFO]: "#cfcfcf",
  [LOG_LEVEL.VERBOSE]: "#a0a0a0",
  [LOG_LEVEL.DEBUG]: "#a0a0a0"
};
export const LOG_STRINGS = {
  [LOG_LEVEL.ERROR]: "ERROR",
  [LOG_LEVEL.WARN]: "WARN",
  [LOG_LEVEL.INFO]: "INFO",
  [LOG_LEVEL.VERBOSE]: "VERBOSE",
  [LOG_LEVEL.DEBUG]: "DEBUG"
};

declare global {
  namespace NodeJS {
    interface Global {
      log_focus?: string;
      log_manager: LOG_MANAGER;
      pedantic_debug: LOG_INTERFACE;
      performance_log: LOG_INTERFACE;
    }
  }
}
