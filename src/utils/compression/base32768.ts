import { decode, encode } from "base32768";
import { COMPRESSOR } from ".";

/**
 * Base32768 compressor
 *
 * @class
 * @implements {COMPRESSOR}
 */
export default class BASE32768_COMPRESSOR implements COMPRESSOR {
  /**
   * Compresses a string to base32768
   *
   * @param {string} data_string the string to compress
   * @returns {string} the compressed string
   */
  public compress(data_string: string): string {
    const buf = Buffer.from(data_string);
    const result = encode(buf);
    return "CMP_32768_" + result;
  }

  /**
   * Decompresses a base32768 string
   *
   * @param {string} compressed_data the compressed data
   * @returns {string} the decompressed string
   */
  public decompress(compressed_data: string): string {
    if (!compressed_data.startsWith("CMP_32768_")) {
      throw new Error("Invalid base32768 string");
    }
    const data = compressed_data.slice(10);
    const arr = decode(data);
    const buf = Buffer.from(arr);
    return buf.toString("utf-8");
  }
}
