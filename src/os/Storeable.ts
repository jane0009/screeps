import { CompressionType, compress, decompress } from "../lib/Compression";

export class Storeable {
  protected _memory: { [key: string]: any } = {};

  public serialize(): string {
    return compress(this._memory, {
      type: CompressionType.BASE32768
    });
  }
  public static deserialize<Type extends Storeable>(_deflated: string): Type {
    const s = new Storeable();
    const inflated = decompress(_deflated, {
      type: CompressionType.BASE32768
    });
    s._memory = inflated;
    return s as Type;
  }

  public junkData(num: number): void {
    for (let i = 0; i < num; i++) {
      const key = `KEY-${i}-${i}`;
      this._memory[key] = key;
    }
  }
}
