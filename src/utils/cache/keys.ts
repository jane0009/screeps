export type CACHE_KEY = (i: any) => string | unknown;

interface _HasName {
  name: string;
}

/**
 * decorator for caching by id
 *
 * @param {_HasId} i the data to cache
 * @returns {string} the id
 */
export const key_by_id = (i: _HasId): string => i.id;

/**
 * decorator for caching by name
 *
 * @param {_HasName} i the data to cache
 * @returns {string} the name
 */
export const key_by_name = (i: _HasName): string => i.name;
