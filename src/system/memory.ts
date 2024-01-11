import { CONSTANTS } from "system";
import { get_compressor } from "utils/compression";
import { LOG_INTERFACE } from "utils/logging";

/**
 * compresses and serializes with RawMemory
 *
 * @class
 */
export class MEMORY_MANAGER {
  private static compressor = get_compressor(CONSTANTS.MEMORY_MANAGER_COMPRESSION_TYPE);
  private static log?: LOG_INTERFACE;

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
    } else {
      RawMemory.set(serialized_memory);
    }
  }

  /**
   * load and decompress all memory
   */
  public static startup(): void {
    if (!this.log) {
      this.log = global.log_manager.get_logger("Memory");
    }
    const raw_memory = RawMemory.get();
    if (raw_memory.length === 0) {
      this.log.warn("No memory found, skipping deserialize");
      return;
    }
    let decompressed_memory;
    try {
      decompressed_memory = this.compressor.decompress(raw_memory);
    } catch (e) {
      this.log.warn("Error decompressing memory, skipping deserialize");
      return;
    }
    const deserialized_memory = JSON.parse(decompressed_memory) as Memory;
    delete global.Memory;
    global.Memory = deserialized_memory;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      Memory?: Memory;
    }
  }
}
