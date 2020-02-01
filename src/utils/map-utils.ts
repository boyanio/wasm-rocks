export const getOrThrow = <K, V>(map: Map<K, V>, key: K, error?: string): V => {
  if (!map.has(key)) throw new Error(error || `Mapping for '${key}' cannot be found`);
  return map.get(key) as V;
};
