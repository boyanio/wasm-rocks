import { emitWat, WatFormatter } from "./wasm/emitter";
import { parse } from "./rockstar/parser";
import { transform } from "./transformer";

export const rockstarToWat = (source: string, formatter: WatFormatter): string => {
  const rockstarAst = parse(source);
  const wasmAst = transform(rockstarAst);
  const output = emitWat(wasmAst, formatter);
  return output;
};
