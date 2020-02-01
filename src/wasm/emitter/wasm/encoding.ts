// https://en.wikipedia.org/wiki/LEB128#Signed_LEB128
export const signedLEB128 = (num: number): number[] => {
  const result: number[] = [];
  let more = true;
  while (more) {
    let byte = num & 0x7f;
    num >>>= 7;
    if ((num === 0 && (byte & 0x40) === 0) || (num === -1 && (byte & 0x40) !== 0)) {
      more = false;
    } else {
      byte |= 0x80;
    }
    result.push(byte);
  }
  return result;
};

// https://en.wikipedia.org/wiki/LEB128#Unsigned_LEB128
export const unsignedLEB128 = (num: number): number[] => {
  const result: number[] = [];
  do {
    let byte = num & 0x7f;
    num >>>= 7;
    if (num !== 0) {
      byte |= 0x80;
    }
    result.push(byte);
  } while (num !== 0);
  return result;
};

export const ieee754 = (num: number): number[] => {
  const arr = new Uint8Array(4);
  const view = new DataView(arr.buffer);
  view.setFloat32(0, num);
  return [...arr.reverse().values()];
};

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
export const encodeVector = (data: (number | number[])[]): number[] => [
  ...unsignedLEB128(data.length),
  ...data.flatMap(x => x)
];

// https://webassembly.github.io/spec/core/binary/values.html#binary-name
export const encodeName = (input: string): number[] => [
  input.length,
  ...input.split("").map(s => s.charCodeAt(0))
];

export const encodeNullTerminatedString = (input: string): number[] => [
  input.length + 1,
  ...input.split("").map(s => s.charCodeAt(0)),
  0x00
];
