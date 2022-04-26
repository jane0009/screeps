import { compressBase32768, decompressBase32768 } from "./compressors/base32768";
import { compressBase64, decompressBase64 } from "./compressors/base64";
export enum CompressionType {
  BASE32768,
  BASE64
}

export interface CompressionOptions {
  type: CompressionType;
}

// class Mapper {
//   public valueFn = (key: string, value: any): string[] => {
//     const map: string[] = [];
//     if (Array.isArray(value)) {
//       value.forEach(val => {
//         const result = this.valueFn(`_`, val);
//         result.forEach(val2 => {
//           map.push(val2);
//         });
//       });
//     } else if (typeof value === "object") {
//       const result = this.mapKeys(value);
//       result.forEach(val => {
//         map.push(val);
//       });
//     } else {
//       map.push(key);
//     }
//     return map;
//   };

//   public mapKeys = (data: { [key: string]: any }): string[] => {
//     const map: string[] = [];
//     for (const key in data) {
//       const value = data[key];
//       const result = this.valueFn(key, value);
//       result.forEach(val => {
//         map.push(val);
//       });
//     }
//     return map;
//   };
// }

const prepareData = (data: { [key: string]: any }): string => {
  // const mapper = new Mapper();
  // const map = mapper.mapKeys(data);

  const str = JSON.stringify(data);
  return str;

  // map.forEach((value, index) => {
  //   str = str.replace(new RegExp(value, "g"), `<${index}>`);
  // });

  // return `${JSON.stringify(map)};!!;${str}`;
};

const parseData = (str: string): { [key: string]: any } => {
  return JSON.parse(str);

  // console.log(str);
  // const split = str.split(";!!;");
  // console.log(split);
  // if (split.length === 1) {
  //   return JSON.parse(split[0]);
  // }
  // const map: string[] = JSON.parse(split[0]);
  // let splitStr = split[1];

  // map.forEach((value, index) => {
  //   splitStr = splitStr.replace(new RegExp(`<${index}>`, "g"), value);
  // });
  // return JSON.parse(splitStr);
};

export const compress = (data: { [key: string]: any }, options: CompressionOptions): string => {
  switch (options.type) {
    case CompressionType.BASE32768:
      return compressBase32768(prepareData(data));
    case CompressionType.BASE64:
      return compressBase64(prepareData(data));
    default:
      return prepareData(data);
  }
};

export const decompress = (compressed: string, options: CompressionOptions): { [key: string]: any } => {
  switch (options.type) {
    case CompressionType.BASE32768:
      return parseData(decompressBase32768(compressed));
    case CompressionType.BASE64:
      return parseData(decompressBase64(compressed));
    default:
      return parseData(compressed);
  }
};
