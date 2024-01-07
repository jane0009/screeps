export class CPU_METER {
  private _precision: number;
  private _start: number;
  public constructor(precision = 1000) {
    this._start = Game.cpu.getUsed();
    this._precision = precision;
  }
  public get used_exact(): number {
    return Game.cpu.getUsed() - this._start;
  }
  public get used(): number {
    return Math.round(this.used_exact * this._precision) / this._precision;
  }
}
