import { CACHE_KEY } from "./keys";
import { CACHE_METHOD, heap_cache, MEMORY_CACHE } from "./methods";
import { default_rehydrater } from "./rehydrate";

type Decorator = (target: unknown, property_key: string | number) => void;

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

const key_by_instance = (i: unknown): unknown => i;

export const heap_cache_getter = (
  getter: (instance: any) => unknown,
  invalidate_cache: ((value: unknown) => boolean) | undefined
): Decorator => {
  return cache_getter(heap_cache, key_by_instance, getter, undefined, invalidate_cache);
};

export const memory_cache_getter = (
  key: CACHE_KEY,
  getter: (instance: any) => unknown,
  rehydrater?: (data: any) => unknown,
  invalidate_cache?: ((value: unknown) => boolean) | undefined
): Decorator => {
  return cache_getter(MEMORY_CACHE, key, getter, rehydrater, invalidate_cache);
};
