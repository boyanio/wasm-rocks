export const findReversed = <T>(
  arr: T[],
  predicate: (item: T, index: number, obj: T[]) => boolean
): T | undefined => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) return arr[i];
  }
  return undefined;
};
