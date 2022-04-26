import { decode, encode } from "base32768";
import { Buffer } from "buffer/";

export function compressBase32768(dat: string): string {
  const buf = Buffer.from(dat);
  return encode(buf);
}

export function decompressBase32768(dat: string): string {
  const arr = decode(dat);
  const buf = Buffer.from(arr);
  return buf.toString("utf-8");
}
