import { Buffer } from "buffer/";

export function compressBase64(dat: string): string {
  const buf = Buffer.from(dat);
  return buf.toString("base64");
}

export function decompressBase64(dat: string): string {
  const buf = Buffer.from(dat, "base64");
  return buf.toString("utf-8");
}
