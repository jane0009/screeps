type SORT_FUNCTION<T> = (a: T, b: T) => number;
type TEST_FUNCTION<T> = (a: T) => number;

/**
 * sorted array
 *
 * @deprecated use the red-black tree instead
 * @class
 */
export class SORTED_ARRAY<T> extends Array<T> {
  /**
   * for typescript to not complain
   *
   * @returns {SORTED_ARRAY<T>} the array class
   */
  public static create<T>(): SORTED_ARRAY<T> {
    return Object.create(SORTED_ARRAY.prototype) as SORTED_ARRAY<T>;
  }

  /**
   * delete an item from the array
   *
   * @param {TEST_FUNCTION<T>} test_fn the item to delete
   * @returns {boolean} true if the item was deleted
   */
  public sdelete(test_fn: TEST_FUNCTION<T>): boolean {
    const found = this._find_item(test_fn, this);
    if (found) {
      this.splice(found.index, 1);
      return true;
    }
    return false;
  }

  /**
   * finds an item in the array
   *
   * @param {TEST_FUNCTION<T>} test_fn the item to find
   * @returns {T|undefined} the item, if found
   */
  public sfind(test_fn: TEST_FUNCTION<T>): T | undefined {
    return this._find_item(test_fn, this)?.result;
  }

  /**
   * pushes an item into the array, sorted
   *
   * @param {SORT_FUNCTION<T>} sort_fn the sort function
   * @param {...any} items the items to push
   * @returns {number} the new length
   */
  public spush(sort_fn: SORT_FUNCTION<T>, ...items: (T | T[])[]): number {
    for (const item of items) {
      if (Array.isArray(item)) {
        this.spush(sort_fn, ...item);
      } else {
        const idx = this._find_index(sort_fn, item, this);
        this.splice(idx, 0, item);
      }
    }
    return this.length;
  }

  /**
   * helper function to find the index to insert an item at
   *
   * @param {SORT_FUNCTION<T>} sort_fn the sort function
   * @param {T} item the item to insert
   * @param {T[]} arr the array to insert into
   * @param {number} [depth=0] the depth of the recursion
   * @returns {number} the index to insert at
   */
  private _find_index(sort_fn: SORT_FUNCTION<T>, item: T, arr: T[], depth = 0): number {
    if (depth > 100) {
      throw new Error("SORTED_ARRAY._find_index: too deep");
    }
    if (arr.length === 0) {
      return 0;
    } else if (arr.length === 1) {
      if (sort_fn(item, arr[0]) > 0) {
        return 1;
      } else {
        return 0;
      }
    } else {
      // find thru binary search
      const odd = arr.length % 2 === 1;
      const idx = Math.floor(arr.length / 2) + (odd ? 1 : 0);
      // 2 -> 1, 4 -> 2, ...
      // 3 -> 2, 5 -> 3, ...
      if (sort_fn(item, arr[idx]) > 0) {
        return idx + this._find_index(sort_fn, item, arr.slice(idx), depth + 1);
      } else {
        return this._find_index(sort_fn, item, arr.slice(0, idx), depth + 1);
      }
    }
  }

  /**
   * helper function to find an item in the array
   *
   * @param {TEST_FUNCTION<T>} sort_fn the item to insert
   * @param {T[]} arr the array to insert into
   * @param {number} current_index the current index
   * @param {number} [depth=0] the depth of the recursion
   * @returns {T|undefined} the item, if found
   */
  private _find_item(
    sort_fn: TEST_FUNCTION<T>,
    arr: T[],
    current_index = 0,
    depth = 0
  ): { index: number; result: T } | undefined {
    if (depth > 100) {
      throw new Error("SORTED_ARRAY._find_item: too deep");
    }
    if (arr.length === 0) {
      return undefined;
    } else if (arr.length === 1) {
      if (sort_fn(arr[0]) === 0) {
        return { result: arr[0], index: current_index };
      } else {
        return undefined;
      }
    } else {
      // binary search tiem!
      const odd = arr.length % 2 === 1;
      const idx = Math.floor(arr.length / 2) + (odd ? 1 : 0);
      if (sort_fn(arr[idx]) === 0) {
        return { result: arr[idx], index: current_index + idx };
      } else if (sort_fn(arr[idx]) > 0) {
        return this._find_item(sort_fn, arr.slice(idx), current_index + idx, depth + 1);
      } else {
        return this._find_item(sort_fn, arr.slice(0, idx), current_index, depth + 1);
      }
    }
  }
}
