import { Buffer } from "buffer";
import { COMPRESSOR } from ".";

/**
 * Base64 compressor
 *
 * @class
 * @implements {COMPRESSOR}
 */
export default class BASE64_COMPRESSOR implements COMPRESSOR {
  /**
   * Compresses a string to base64
   *
   * @param {string} data_string the string to compress
   */
  public compress(data_string: string): string {
    const buf = Buffer.from(data_string);
    const result = buf.toString("base64");
    return "CMP_64_" + result;
  }
  /**
   * Decompresses a base64 string
   *
   * @param {string} compressed_data the compressed data
   * @returns {string} the decompressed string
   */
  public decompress(compressed_data: string): string {
    if (!compressed_data.startsWith("CMP_64_")) {
      throw new Error("Invalid base64 string");
    }
    const data = compressed_data.slice(7);
    const buf = Buffer.from(data, "base64");
    return buf.toString("utf-8");
  }
}
