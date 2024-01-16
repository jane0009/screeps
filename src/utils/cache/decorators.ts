import * as CONSTANTS from "../constants";
import { LRU_CACHE, MEMORY_CACHE, TTL_CACHE } from "./methods";
import { default_rehydrater, Rehydrater } from "./rehydrate";

/**
 * memory cache decorator, only on members
 *
 * @param {CACHE_KEY} key the cache key
 * @param {Rehydrater} rehydrater the rehydrater method to use
 * @returns {decorator} decorator function
 */
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

/**
 * lru cache decorator
 *
 * @param {CACHE_KEY} key the cache key
 * @param {number} size the size of the cache
 * @param {Rehydrater} rehydrater the rehydrater method to use
 * @returns {decorator} decorator function
 */
export const lru_cache = (
  key: (instsance: any) => string,
  size: number = CONSTANTS.MEMORY_CACHE_LRU_CACHE_SIZE,
  rehydrater: Rehydrater = default_rehydrater
) => {
  return (target: unknown, property_key: string | number): void => {
    const SIZED_LRU_CACHE = LRU_CACHE(size);
    Object.defineProperty(target, property_key, {
      get(): unknown {
        return rehydrater(SIZED_LRU_CACHE.get(key(this), property_key));
      },
      set(newValue: unknown) {
        return SIZED_LRU_CACHE.set(key(this), property_key, newValue);
      },
      enumerable: true
    });
  };
};

/**
 * ttl cache decorator
 *
 * @param {CACHE_KEY} key the cache key
 * @param {number} ttl the ttl of the cache
 * @param {Rehydrater} rehydrater the rehydrater method to use
 * @returns {decorator} decorator function
 */
export const ttl_cache = (
  key: (instance: any) => string,
  ttl: number = CONSTANTS.MEMORY_CACHE_TTL_CACHE_TTL,
  rehydrater: Rehydrater = default_rehydrater
) => {
  return (target: unknown, property_key: string | number): void => {
    const SIZED_TTL_CACHE = TTL_CACHE(ttl);
    Object.defineProperty(target, property_key, {
      get(): unknown {
        return rehydrater(SIZED_TTL_CACHE.get(key(this), property_key));
      },
      set(newValue: unknown) {
        return SIZED_TTL_CACHE.set(key(this), property_key, newValue);
      },
      enumerable: true
    });
  };
};
