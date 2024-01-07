export type CACHE_KEY = (i: any) => string | unknown;

interface _HasName {
  name: string;
}

export const key_by_id = (i: _HasId): string => i.id;

export const key_by_name = (i: _HasName): string => i.name;
