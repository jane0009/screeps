export default class PriorityQueue<Type> {
  private _queue: Type[] = [];
  private compareFn: (a: Type, b: Type) => number;

  public constructor(compareFn: (a: Type, b: Type) => number) {
    this.compareFn = compareFn;
  }

  private _sort(): void {
    this._queue.sort(this.compareFn);
  }

  public push(value: Type): void {
    this._queue.push(value);
    this._sort();
  }
  public pop(): Type | undefined {
    return this._queue.shift();
  }

  public top(): Type | undefined {
    return this._queue?.[0];
  }

  public clear(): void {
    this._queue = [];
  }
}
