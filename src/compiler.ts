import { emitWat, WatFormatter, emitWasm } from "./wasm/emitter";
import { parse } from "./rockstar/parser";
import { transform } from "./transformer";

export const rockstarToWat = (source: string, formatter: WatFormatter): string => {
  const rockstarAst = parse(source);
  const wasmAst = transform(rockstarAst);
  const output = emitWat(wasmAst, formatter);
  return output;
};

export const rockstarToWasm = (source: string): Uint8Array => {
  const rockstarAst = parse(source);
  const wasmAst = transform(rockstarAst);
  const output = emitWasm(wasmAst);
  return output;
};
