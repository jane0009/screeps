import { decode, encode } from "base32768";
import { COMPRESSOR } from ".";

export default class BASE32768_COMPRESSOR implements COMPRESSOR {
  public compress(dat: string): string {
    const buf = Buffer.from(dat);
    return encode(buf);
  }
  public decompress(dat: string): string {
    const arr = decode(dat);
    const buf = Buffer.from(arr);
    return buf.toString("utf-8");
  }
}
