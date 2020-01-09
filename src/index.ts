import { parse } from "./rockstar/parser";
import { transform } from "./wasm/transformer";
import { emitWat, withIdentation } from "./wasm/emitter";

(function init(): void {
  const sourceEditor = document.getElementById("rockstar-source") as HTMLTextAreaElement;
  const emittedWatEditor = document.getElementById("emitted-wat") as HTMLTextAreaElement;

  sourceEditor.addEventListener("keyup", () => {
    let what: string;
    try {
      what = emitWat(withIdentation(2), transform(parse(sourceEditor.value)));
    } catch (err) {
      what = err.toString();
    }
    emittedWatEditor.value = what;
  });
})();
