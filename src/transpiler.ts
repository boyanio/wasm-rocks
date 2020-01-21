import { emitWat, WatVectorEncoder } from "./wasm/emitter";
import { parse } from "./rockstar/parser";
import { transform } from "./transformer";

export const toWat = (source: string, vectorEncoder: WatVectorEncoder): string => {
  const rockstarAst = parse(source);
  const wasmAst = transform(rockstarAst);
  const output = emitWat(wasmAst, vectorEncoder);
  return output;
};
