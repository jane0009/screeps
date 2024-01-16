import * as COMPRESSION from "./compression";
import * as CONSTANTS from "./constants";
import * as LOGGING from "./logging";
import * as OBJECT from "./object";

/**
 * compresses and serializes with RawMemory
 *
 * @class
 */
export class MEMORY_MANAGER {
  private static compressor = COMPRESSION.get_compressor(CONSTANTS.MEMORY_MANAGER_COMPRESSION_TYPE);
  private static empty_memory: Memory = {
    creeps: {},
    powerCreeps: {},
    flags: {},
    rooms: {},
    sources: {},
    spawns: {},
    cache: {}
  };
  private static log?: LOGGING.LOG_INTERFACE;

  /**
   * delete RawMemory._parsed to prevent serialization,
   * serialize memory to RawMemory if it has changed
   */
  public static end_tick(): void {
    if (!CONSTANTS.MEMORY_MANAGER_COMPRESSION_ENABLED) {
      RawMemory._parsed = global.Memory;
      return;
    }
    if (!this.log) {
      this.log = global.log_manager.get_logger("Memory");
    }
    delete RawMemory._parsed;
    this.log?.debug("Memory compare:", global.TEMP_MEMORY, global.Memory);
    if (global.TEMP_MEMORY === undefined) {
      this.log?.verbose("Cached memory does not exist, saving");
      this.save();
    } else {
      if (!OBJECT.deep_compare(global.TEMP_MEMORY, global.Memory)) {
        this.log?.verbose("Memory has changed, saving");
        this.save();
      } else {
        this.log?.verbose("Deep compare return true, skipping serialize");
      }
    }
  }
  /**
   * load and decompress all memory
   */
  public static load(): void {
    if (!this.log) {
      this.log = global.log_manager.get_logger("Memory");
    }
    if (CONSTANTS.MEMORY_MANAGER_COMPRESSION_ENABLED && global.TEMP_MEMORY !== undefined) {
      this.log?.verbose("Cached memory exists, skipping deserialize");
      delete global.Memory;
      global.pedantic_debug?.debug("memory.ts L53 assign Memory = TEMP_MEMORY");
      global.Memory = OBJECT.clone(global.TEMP_MEMORY);
      // force global.Memory -> Memory
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      Memory.rooms;
      return;
    }
    const raw_memory = RawMemory.get();
    if (CONSTANTS.MEMORY_MANAGER_COMPRESSION_ENABLED || raw_memory.startsWith("CMP_")) {
      if (raw_memory.length === 0) {
        this.log.warn("No memory found, skipping deserialize");
        global.Memory = OBJECT.clone(this.empty_memory);
        // force global.Memory -> Memory
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        Memory.rooms;
        return;
      }
      let decompressed_memory;
      try {
        decompressed_memory = this.compressor.decompress(raw_memory);
      } catch (e) {
        this.log.warn("Error decompressing memory, skipping deserialize");
        delete global.Memory;
        global.Memory = OBJECT.clone(this.empty_memory);
        // force global.Memory -> Memory
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        Memory.rooms;
        return;
      }
      const deserialized_memory = JSON.parse(decompressed_memory) as Memory;
      delete global.Memory;
      global.Memory = OBJECT.clone<Memory>(deserialized_memory);
      global.pedantic_debug?.debug("memory.ts L76 assign TEMP_MEMORY = deserialized_memory");
      global.TEMP_MEMORY = OBJECT.clone(deserialized_memory);
    }
  }

  /**
   * compress and save all memory,
   * handle things like task state
   */
  public static save(): void {
    // TODO integrate with cache?
    if (!this.log) {
      this.log = global.log_manager.get_logger("Memory");
    }
    const serialized_memory = JSON.stringify(Memory);
    if (CONSTANTS.MEMORY_MANAGER_COMPRESSION_ENABLED) {
      const compressed_memory = this.compressor.compress(serialized_memory);
      RawMemory.set(compressed_memory);
      delete RawMemory._parsed;
      global.pedantic_debug?.debug("memory.ts L94 delete TEMP_MEMORY");
      delete global.TEMP_MEMORY;
    }
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      Memory?: Memory;
      TEMP_MEMORY?: Memory;
    }
  }

  interface RawMemory {
    _parsed?: Memory;
  }
}
