export enum COMPRESSION_TYPE {
  BASE32768,
  BASE64
}

export interface COMPRESSOR {
  compress(dat: string): string;
  decompress(dat: string): string;
}
