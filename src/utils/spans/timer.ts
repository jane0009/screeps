/**
 * measure game ticks since constructed
 *
 * @class
 */
export class TIMER {
  private _start: number;
  /**
   * creates an instance of TIMER
   *
   * @constructs TIMER
   */
  public constructor() {
    this._start = Game.time;
  }

  /**
   * gets the number of ticks since the creation of the object
   *
   * @returns {number} the number of ticks
   */
  public get elapsed(): number {
    return Game.time - this._start;
  }
}
