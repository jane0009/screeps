export default class PriorityQueue<Type> {
  private _queue: Type[] = [];
  private compare_fn: (a: Type, b: Type) => number;

  constructor(compare_fn: (a: Type, b: Type) => number) {
    this.compare_fn = compare_fn;
  }

  private _sort() {
    this._queue.sort(this.compare_fn);
  }

  push(value: Type) {
    this._queue.push(value);
    this._sort();
  }
  pop(): Type | undefined {
    return this._queue.shift();
  }

  top(): Type | undefined {
    return this._queue?.[0];
  }

  clear() {
    this._queue = [];
  }
}
