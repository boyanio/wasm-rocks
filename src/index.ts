import { parse } from "./rockstar/parser";
import { transform } from "./wasm/transformer";
import { emitWat } from "./wasm/emitter";

(function init(): void {
  const sourceEditor = document.getElementById("rockstar-source") as HTMLTextAreaElement;
  const emittedWatEditor = document.getElementById("emitted-wat") as HTMLTextAreaElement;

  sourceEditor.addEventListener("keyup", () => {
    const wat = emitWat(transform(parse(sourceEditor.value)));
    emittedWatEditor.value = wat;
  });
})();
