import { assert } from "chai";
import { SORTED_ARRAY } from "../../src/utils/structures";

describe("sorted array", () => {
  it("should export a SORTED_ARRAY class", () => {
    assert.isTrue(typeof SORTED_ARRAY === "function");
  });

  it("array methods should work as usual", () => {
    const arr = SORTED_ARRAY.create<number>();
    arr.push(1);
    arr.push(2);
    arr.push(3);
    assert.equal(arr.length, 3);
    assert.equal(arr[0], 1);
    assert.equal(arr[1], 2);
    assert.equal(arr[2], 3);
  });

  it("array should be properly sorted if using spush", () => {
    const arr = SORTED_ARRAY.create<number>();
    const normal_arr: number[] = [];
    for (let i = 0; i < 20; i++) {
      const rand = Math.floor(Math.random() * 100);
      arr.spush((a, b) => a - b, rand);
      normal_arr.push(rand);
    }
    normal_arr.sort((a, b) => a - b);
    for (let i = 0; i < 20; i++) {
      assert.equal(arr[i], normal_arr[i]);
    }
  });

  it("array should handle bulk inserting", () => {
    const arr = SORTED_ARRAY.create<number>();
    const temp_arr: number[] = [];
    for (let i = 0; i < 20; i++) {
      const rand = Math.floor(Math.random() * 100);
      temp_arr.push(rand);
    }
    arr.spush((a, b) => a - b, temp_arr);
    assert.equal(arr.length, 20);
    for (let i = 0; i < 19; i++) {
      assert.isTrue(arr[i] <= arr[i + 1]);
    }
  });

  it("array sfind should work", () => {
    const arr = SORTED_ARRAY.create<number>();
    const numbers = [...Array(50).keys()];
    const search = numbers[Math.floor(Math.random() * numbers.length)];
    numbers.sort(() => (Math.random() > 0.5 ? 1 : -1));
    arr.spush((a, b) => a - b, numbers);

    // find
    const result = arr.sfind((a) => {
      return search - a;
    });
    assert.isDefined(result);
    assert.equal(result, search);
  });

  it("array sdelete should work", () => {
    const arr = SORTED_ARRAY.create<number>();
    const numbers = [...Array(50).keys()];
    const search = numbers[Math.floor(Math.random() * numbers.length)];
    numbers.sort(() => (Math.random() > 0.5 ? 1 : -1));
    arr.spush((a, b) => a - b, numbers);

    // find
    const result = arr.sfind((a) => {
      return search - a;
    });
    assert.isDefined(result);
    assert.equal(result, search);

    // delete
    const deleted = arr.sdelete((a) => {
      return search - a;
    });
    assert.isTrue(deleted);

    // find should now return undefined
    const result2 = arr.sfind((a) => {
      return search - a;
    });
    assert.isUndefined(result2);
  });
});
