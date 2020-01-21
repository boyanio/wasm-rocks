export type VectorEncoder<S, D> = (...data: S[]) => D;

export type WatVectorEncoder = VectorEncoder<string | number | undefined, string>;
