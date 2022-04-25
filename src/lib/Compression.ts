import { compressBase64, decompressBase64 } from './compressors/base64';
export enum CompressionType {
  BASE32768,
  BASE64
}

export type CompressionOptions = {
  type: CompressionType;
}

export const compress = (data: { [key: string]: any }, options: CompressionOptions): string => {
  switch (options.type) {
    case CompressionType.BASE64: return compressBase64(JSON.stringify(data));
    default: return JSON.stringify(data)
  }
}

export const decompress = (compressed: string, options: CompressionOptions): { [key: string]: any } => {
  switch (options.type) {
    case CompressionType.BASE64: return JSON.parse(decompressBase64(compressed));
    default: return JSON.parse(compressed)
  }
}
