import { WatFormatter, emitWat } from "./wasm/emitter";
import { parse } from "./rockstar/parser";
import { transform } from "./transformer";

export const toWat = (source: string, formatter: WatFormatter): string => {
  const rockstarAst = parse(source);
  const wasmAst = transform(rockstarAst);
  const output = emitWat(formatter, wasmAst);
  return output;
};
