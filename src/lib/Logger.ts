
export const LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'debug'
]

export const LOG_COLORS = {
  'error': '#cc0000',
  'warn': '#cc7700',
  'info': '#cfcfcf',
  'debug': '#a0a0a0'
}

export default class Logger {
  constructor() {

  }

  public logLevel: string = 'info';

  public setLogLevel(logLevel: string) {
    if (LOG_LEVELS.indexOf(logLevel) != -1) {
      this.logLevel = logLevel;
    }
  }

  _getColor(logLevel: string) {
    switch (logLevel) {
      case 'error': return LOG_COLORS.error;
      case 'warn': return LOG_COLORS.warn;
      case 'info': return LOG_COLORS.info;
      case 'debug': return LOG_COLORS.debug;
      default: return '#ffffff';
    }
  }

  _log(msg: string, level: string) {
    if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(this.logLevel)) {
      let color = this._getColor(level);
      let timestamp = global.Inscribe.time(color);

      console.log(global.Inscribe.color(`[${timestamp}] [${level}]: ${msg}`, color));
    }
  }

  _email(msg: string) {
    // todo
  }

  public debug(msg: string) {
    return this._log(msg, 'debug');
  }
  public info(msg: string) {
    return this._log(msg, 'info');
  }
  public warn(msg: string) {
    return this._log(msg, 'warn');
  }
  public error(msg: string) {
    return this._log(msg, 'error');
  }
}
