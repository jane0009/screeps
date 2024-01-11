/**
 * used to track the amount of CPU used since the creation of the object
 *
 * @class
 */
export class CPU_METER {
  private _precision: number;
  private _start: number;
  /**
   * creates an instance of CPU_METER
   *
   * @constructs CPU_METER
   * @param {number} precision what to round to when accessing the {@link used} property. power of 10
   */
  public constructor(precision = 1000) {
    this._start = Game.cpu.getUsed();
    this._precision = precision;
  }
  /**
   * gets the exact amount of CPU used since the creation of the object
   *
   * @returns {number} the exact amount of CPU used
   */
  public get used_exact(): number {
    return Game.cpu.getUsed() - this._start;
  }
  /**
   * gets the amount of CPU used since the creation of the object, rounded to the precision given in the constructor
   *
   * @returns {number} the rounded amount of CPU used
   */
  public get used(): number {
    return Math.round(this.used_exact * this._precision) / this._precision;
  }
}
