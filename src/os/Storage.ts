import { compress, CompressionType, decompress } from '../lib/Compression'

export class Storeable {
  protected _memory: { [key: string]: any } = {};

  serialize(): string {
    return compress(this._memory, {
      type: CompressionType.BASE64
    });
  }
  static deserialize<Type extends Storeable>(_deflated: string): Type {
    let s = new Storeable();
    let inflated = decompress(_deflated, {
      type: CompressionType.BASE64
    });
    s._memory = inflated;
    return <Type>s;
  }
}
