import * as CONSTANTS from "../constants";
import { LOG_INTERFACE } from "../logging";
import { RED_BLACK_TREE } from "../structures/rb_tree";

export interface CACHE_METHOD {
  get: (key: any, property_key: any) => unknown;
  set: (key: any, property_key: any, value: any) => void;
}

let log: LOG_INTERFACE | undefined;

export const MEMORY_CACHE = {
  /**
   * gets a value from the cache
   *
   * @param {string} key the cache key
   * @param {string|number} property_key the property key
   * @returns {unknown} the value, if present
   */
  get: (key: string, property_key: string | number): unknown => Memory.cache?.[key]?.[property_key],
  /**
   * sets a value in the cache
   *
   * @param {string} key the cache key
   * @param {string|number} property_key the property key
   * @param {unknown} value the value to set
   */
  set: (key: string, property_key: string | number, value: unknown): void => {
    Memory.cache ??= {};
    Memory.cache[key] ??= {};
    Memory.cache[key][property_key] = value;
  }
};

const cache = new WeakMap<Record<string, unknown>, Record<string, unknown>>();
export const HEAP_CACHE = {
  /**
   * gets a value from the cache
   *
   * @param {Record<string, unknown>} key the cache key
   * @param {string|number} property_key the property key
   * @returns {unknown} the value, if present
   */
  get: (key: Record<string, unknown>, property_key: string | number): unknown => (cache.get(key) ?? {})?.[property_key],
  /**
   * sets a value in the cache
   *
   * @param {Record<string, unknown>} key the cache key
   * @param {string|number} property_key the property key
   * @param {unknown} value the value to set
   */
  set: (key: Record<string, unknown>, property_key: string | number, value: unknown): void => {
    cache.set(key, {
      ...(cache.get(key) ?? {}),
      [property_key]: value
    });
  }
};

interface cache_record {
  key: string;
  touched: number;
}

const sort = new RED_BLACK_TREE<cache_record>((item: cache_record) => item.touched, "LRU_CACHE");
/**
 * getter for LRU cache
 *
 * @param {number} size the max cache size
 * @returns {CACHE_METHOD} the cache methods
 */
export const LRU_CACHE = (size = CONSTANTS.MEMORY_CACHE_LRU_CACHE_SIZE): CACHE_METHOD => ({
  /**
   * gets a value from the cache
   *
   * @param {string} key the cache key
   * @param {string|number} property_key the property key
   * @returns {unknown} the value, if present
   */
  get: (key: string, property_key: string | number): unknown => {
    Memory.cache ??= {};
    Memory.cache[key] ??= {};
    const sort_key = `${key}.${property_key}`;
    const result = sort.find_by_non_indexing_constraint((item) => item.key === sort_key);
    if (Memory.cache[key][property_key] === undefined) {
      if (result) {
        sort.remove_by_index(result.index);
      }
      return undefined;
    } else {
      if (result) {
        sort.update_by_index(result.index, {
          key: sort_key,
          touched: Game.time
        });
      }
      return Memory.cache?.[key]?.[property_key];
    }
  },
  /**
   * sets a value in the cache
   *
   * @param {string} key the cache key
   * @param {string|number} property_key the property key
   * @param {unknown} value the value to set
   */
  set: (key: string, property_key: string | number, value: unknown): void => {
    Memory.cache ??= {};
    Memory.cache[key] ??= {};
    if (sort.size >= size) {
      // delete the oldest
      const oldest = sort.find_by_constraint(() => -1, true);
      if (oldest) {
        sort.remove_by_index(oldest.index);
      } else {
        if (!log) {
          log = global.log_manager.get_logger("Cache");
        }
        log.warn("LRU cache is full, but no oldest item found");
      }
    }
    const sort_key = `${key}.${property_key}`;
    const found = sort.find_by_non_indexing_constraint((item) => item.key === sort_key);
    if (found) {
      sort.update_by_index(found.index, {
        key: sort_key,
        touched: Game.time
      });
    } else {
      sort.insert({
        key: sort_key,
        touched: Game.time
      });
    }
    Memory.cache[key][property_key] = value;
  }
});

/**
 * getter for TTL cache
 *
 * @param {number} ttl the cache ttl
 * @returns {CACHE_METHOD} the cache methods
 */
export const TTL_CACHE = (ttl: number = CONSTANTS.MEMORY_CACHE_TTL_CACHE_TTL): CACHE_METHOD => ({
  /**
   * gets a value from the cache
   *
   * @param {string} key the cache key
   * @param {string | number} property_key the property key
   * @returns {unknown} the value, if present
   */
  get: (key: string, property_key: string | number): unknown => {
    Memory.cache ??= {};
    if (Memory.cache[key]?.[property_key] !== undefined) {
      const key_ttl = Memory.cache[key]?.[`${property_key}_ttl`] as number | undefined;
      if (key_ttl !== undefined) {
        if (key_ttl > Game.time) {
          return Memory.cache[key]?.[property_key];
        } else {
          delete Memory.cache[key]?.[property_key];
          delete Memory.cache[key]?.[`${property_key}_ttl`];
        }
      }
    }
    return undefined;
  },
  /**
   * sets a value in the cache
   *
   * @param {string} key the cache key
   * @param {string | number} property_key the property key
   * @param {unknown} value the value to set
   */
  set: (key: string, property_key: string | number, value: unknown): void => {
    Memory.cache ??= {};
    Memory.cache[key] ??= {};
    Memory.cache[key][property_key] = value;
    Memory.cache[key][`${property_key}_ttl`] = Game.time + ttl;
  }
});
