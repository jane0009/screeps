import { CACHE_KEY } from "./keys";
import { CACHE_METHOD, HEAP_CACHE, MEMORY_CACHE } from "./methods";
import { default_rehydrater } from "./rehydrate";

type Decorator = (target: unknown, property_key: string | number) => void;

/**
 * cacheGetter https://github.com/glitchassassin/screeps-cache/blob/main/src/GetterCache.ts
 *
 * @param {CACHE_METHOD} cache_method method to use
 * @param {CACHE_KEY} key the key to use
 * @param {(any) => unknown | undefined} getter the getter method to use
 * @param {rehydrater} rehydrater the rehydrater method to use
 * @param {(unknown) => boolean} invalidate_cache function to check if the value should be invalidated
 * @returns {CACHE_METHOD} the implementation of the cache method
 */
const cache_getter = (
  cache_method: CACHE_METHOD,
  key: CACHE_KEY,
  getter: (instance: any) => unknown | undefined,
  rehydrater: (data: any) => unknown = default_rehydrater,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  invalidate_cache = (value: unknown) => false
) => {
  return (target: unknown, property_key: string | number): void => {
    Object.defineProperty(target, property_key, {
      get(): unknown {
        let value = getter(this);
        if (value === undefined && !invalidate_cache(value)) {
          value = cache_method.get(key(this), property_key);
        }
        cache_method.set(key(this), property_key, value);
        return rehydrater(value);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      set() {},
      enumerable: true
    });
  };
};

/**
 * key by instance decorator, returns itself
 *
 * @param {unknown} i the instance
 * @returns {unknown} the instance
 */
const key_by_instance = (i: unknown): unknown => i;

/**
 * getter for heap_cache
 *
 * @param {(any) => unknown} getter the getter method to use
 * @param {(unknown) => boolean} invalidate_cache function to check if the value should be invalidated
 * @returns {CACHE_METHOD} the implementation of the cache method
 */
export const heap_cache_getter = (
  getter: (instance: any) => unknown,
  invalidate_cache?: ((value: unknown) => boolean) | undefined
): Decorator => {
  return cache_getter(HEAP_CACHE, key_by_instance, getter, undefined, invalidate_cache);
};

/**
 * getter for memory_cache
 *
 * @param {CACHE_KEY} key the cache key
 * @param {(any) => unknown} getter the getter method to use
 * @param {(any) => unknown} rehydrater the rehydrater method to use
 * @param {(any) => boolean} invalidate_cache function to check if the value should be invalidated
 * @returns {CACHE_METHOD} the implementation of the cache method
 */
export const memory_cache_getter = (
  key: CACHE_KEY,
  getter: (instance: any) => unknown,
  rehydrater?: (data: any) => unknown,
  invalidate_cache?: ((value: unknown) => boolean) | undefined
): Decorator => {
  return cache_getter(MEMORY_CACHE, key, getter, rehydrater, invalidate_cache);
};
