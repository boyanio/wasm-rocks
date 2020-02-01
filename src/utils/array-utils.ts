export const findReversed = <T>(
  arr: T[],
  predicate: (item: T, index: number, obj: T[]) => boolean
): T | undefined => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i, arr)) return arr[i];
  }
  return undefined;
};

export const countUnique = <T>(arr: T[]): [T, number][] => {
  const map = new Map<T, number>();
  arr.forEach(item => {
    if (map.has(item)) {
      map.set(item, (map.get(item) as number) + 1);
    } else {
      map.set(item, 1);
    }
  });
  return [...map.entries()];
};

export const arrayEquals = <T>(lhs: T[], rhs: T[]): boolean => {
  if (lhs.length != rhs.length) return false;

  for (let i = 0, l = lhs.length; i < l; i++) {
    const left = lhs[i];
    const right = rhs[i];
    if (Array.isArray(left) && Array.isArray(right)) {
      if (!arrayEquals(left, right)) return false;
    } else if (left !== right) {
      return false;
    }
  }
  return true;
};
