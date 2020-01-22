export type VectorEncoder<T> = (data: unknown[]) => T;

export type WatVectorEncoder = VectorEncoder<string>;
