export interface CACHE_METHOD {
  get: (key: any, property_key: any) => unknown;
  set: (key: any, property_key: any, value: any) => void;
}

export const MEMORY_CACHE = {
  get: (key: string, property_key: string | number): unknown => Memory.cache?.[key]?.[property_key],
  set: (key: string, property_key: string | number, value: unknown): void => {
    Memory.cache ??= {};
    Memory.cache[key] ??= {};
    Memory.cache[key][property_key] = value;
  }
};

const cache = new WeakMap<Record<string, unknown>, Record<string, unknown>>();
export const heap_cache = {
  get: (key: Record<string, unknown>, property_key: string | number): unknown => (cache.get(key) ?? {})?.[property_key],
  set: (key: Record<string, unknown>, property_key: string | number, value: unknown): void => {
    cache.set(key, {
      ...(cache.get(key) ?? {}),
      [property_key]: value
    });
  }
};
