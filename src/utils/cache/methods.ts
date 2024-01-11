export interface CACHE_METHOD {
  get: (key: any, property_key: any) => unknown;
  set: (key: any, property_key: any, value: any) => void;
}

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
export const heap_cache = {
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
