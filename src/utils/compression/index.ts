import BASE32768_COMPRESSOR from "./base32768";
import BASE64_COMPRESSOR from "./base64";

export enum COMPRESSION_TYPE {
  BASE32768,
  BASE64
}

export interface COMPRESSOR {
  compress(data_string: string): string;
  decompress(compressed_data: string): string;
}

/**
 * get the compressor specified in constants
 *
 * @param {COMPRESSION_TYPE} type the compression type
 * @returns {COMPRESSOR} the compressor
 */
export const get_compressor = (type: COMPRESSION_TYPE): COMPRESSOR => {
  switch (type) {
    case COMPRESSION_TYPE.BASE32768:
      return new BASE32768_COMPRESSOR();
    case COMPRESSION_TYPE.BASE64:
      return new BASE64_COMPRESSOR();
    default:
      return new BASE32768_COMPRESSOR();
  }
};
