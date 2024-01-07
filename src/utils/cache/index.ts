// shamelessly cobbled together from:
// https://github.com/glitchassassin/screeps-cache
// https://github.com/mortenbroesby/screeps-lru-cache

export * from "./decorators";
export * from "./keys";
export * from "./methods";
export * from "./rehydrate";

declare global {
  interface Memory {
    cache: {
      [type: string]: {
        [id: string]: any;
      };
    };
  }
}
