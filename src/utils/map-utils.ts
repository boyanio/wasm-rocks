export const getOrThrow = <K, V>(map: Map<K, V>, key: K, error: string): V => {
  if (!map.has(key)) throw new Error(error);
  return map.get(key) as V;
};
