
export function compressBase64(dat: string) {
  let buf = Buffer.from(dat)
  return buf.toString('base64');
}

export function decompressBase64(dat: string) {
  let buf = Buffer.from(dat, "base64")
  return buf.toString()
}
