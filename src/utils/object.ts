/**
 * used for recursive logging, to only log at the root level
 *
 * @param {boolean} root whether this is the root call
 * @param {string} message the message to log
 * @param {...any} args extra arguments
 */
function root_log(root: boolean, message: string, ...args: unknown[]): void {
  if (root) {
    global.pedantic_debug.verbose(message, ...args);
  } else {
    global.pedantic_debug.debug(message, ...args);
  }
}

/**
 * Test if two variables are deeply equal
 *
 * @param {unknown} a the first variable
 * @param {unknown} b the second variable
 * @param {boolean} [root=true] whether this is the root call
 * @returns {boolean} true if the variables are deeply equal
 */
export function deep_compare(a: unknown, b: unknown, root = true): boolean {
  const type_a = typeof a;
  if (type_a !== typeof b) {
    root_log(root, `Type mismatch: ${type_a} !== ${typeof b}`, a, b);
    return false;
  }
  if (type_a === "object") {
    const arr_a = Array.isArray(a);
    if (arr_a !== Array.isArray(b)) {
      root_log(root, `Type mismatch: both are not arrays`, a, b);
      return false;
    }
    if (arr_a) {
      const b_arr = b as any[];
      if (a.length !== b_arr.length) {
        root_log(root, `Array length mismatch: ${a.length} !== ${b_arr.length}`, a, b);
        return false;
      }
      const array_test = a.every((value: any, index: number) => {
        return deep_compare(value, b_arr[index], false);
      });
      if (!array_test) {
        root_log(root, `Array test failed on:`, a, b);
      }
      return array_test;
    } else {
      const a_obj = a as Record<string, unknown>;
      const b_obj = b as Record<string, unknown>;
      const a_keys = Object.keys(a_obj);
      const b_keys = Object.keys(b_obj);
      if (a_keys.length !== b_keys.length) {
        root_log(root, `Object length mismatch: ${a_keys.length} !== ${b_keys.length}`, a, b);
        return false;
      }
      const key_test = a_keys.every((key: string) => {
        return deep_compare(a_obj[key], b_obj[key], false);
      });
      if (!key_test) {
        root_log(root, `Object test failed on:`, a, b);
      }
      return key_test;
    }
  } else {
    if (a !== b) {
      root_log(root, `Primitive test failed on:`, a, b);
    }
    return a === b;
  }
}

/**
 * Clone an object
 *
 * @param {T} obj the object to clone
 * @returns {T} the cloned object
 */
export function clone<T>(obj: T): T {
  if (typeof obj !== "object") {
    return obj;
  } else {
    const result: {
      [key: string]: any;
    } = {};
    const record = obj as Record<string, unknown>;
    const keys = Object.keys(record);
    for (const key of keys) {
      result[key] = clone(record[key]);
    }
    return result as T;
  }
}

/**
 * Sum an array
 *
 * @param {T[]} arr the array to sum
 * @param {Function} func the function to apply to each element
 * @returns {number} the sum of the array
 */
export function sum<T>(arr: T[], func: (value: T) => number): number {
  return arr.reduce((acc, value) => acc + func(value), 0);
}
