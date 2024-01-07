import { COMPRESSOR } from ".";

export default class BASE64_COMPRESSOR implements COMPRESSOR {
  public compress(dat: string): string {
    const buf = Buffer.from(dat);
    return buf.toString("base64");
  }
  public decompress(dat: string): string {
    const buf = Buffer.from(dat, "base64");
    return buf.toString("utf-8");
  }
}
