export const escapeDoubleQuotes = (input: string): string => input.replace('"', '\\"');

export const capitalize = (input: string): string =>
  input[0].toUpperCase() + input.substring(1).toLowerCase();

export const countOccurrences = (input: string, part: string): number => {
  let count = 0;
  let index = input.indexOf(part);
  while (index >= 0) {
    count++;
    index = input.indexOf(part, index + 1);
  }
  return count;
};

export const splitOnce = (input: string, separator: string): [string, string] => {
  const separatorIndex = input.indexOf(separator);
  return separatorIndex >= 0
    ? [input.substring(0, separatorIndex), input.substring(separatorIndex + separator.length)]
    : [input, ""];
};
