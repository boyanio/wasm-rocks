import { withIdentation } from "./wasm/emitter";
import { toWat } from "./transpiler";

(function init(): void {
  const sourceEditor = document.getElementById("rockstar-source") as HTMLTextAreaElement;
  const emittedWatEditor = document.getElementById("emitted-wat") as HTMLTextAreaElement;

  sourceEditor.addEventListener("keyup", () => {
    let what: string;
    try {
      what = toWat(sourceEditor.value, withIdentation(2));
    } catch (err) {
      what = err.toString();
    }
    emittedWatEditor.value = what;
  });
})();
