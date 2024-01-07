export class TIMER {
  private _start: number;
  public constructor() {
    this._start = Game.time;
  }

  public get elapsed(): number {
    return Game.time - this._start;
  }
}
