import { MEMORY_CACHE } from "./methods";
import { default_rehydrater, Rehydrater } from "./rehydrate";

export const memory_cache = (key: (instance: any) => string, rehydrater: Rehydrater = default_rehydrater) => {
  return (target: unknown, property_key: string | number): void => {
    Object.defineProperty(target, property_key, {
      get(): unknown {
        return rehydrater(MEMORY_CACHE.get(key(this), property_key));
      },
      set(newValue: unknown) {
        return MEMORY_CACHE.set(key(this), property_key, newValue);
      },
      enumerable: true
    });
  };
};
