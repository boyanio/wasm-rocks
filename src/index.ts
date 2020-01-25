import { identedFormatter } from "./wasm/emitter";
import { rockstarToWat } from "./compiler";
import CodeMirror from "codemirror";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const WabtModule: any;

(function init(): void {
  const initialRockstar = `
Midnight takes your heart and your soul
While your heart is as high as your soul
Put your heart without your soul into your heart

Give back your heart


Desire is a lovestruck ladykiller
My world is nothing 
Fire is ice
Hate is water
Until my world is Desire,
Build my world up
If Midnight taking my world, Fire is nothing and Midnight taking my world, Hate is nothing
Shout 1
Take it to the top

If Midnight taking my world, Fire is nothing
Shout 2
Take it to the top

If Midnight taking my world, Hate is nothing
Say 3
Take it to the top

Whisper my world
`;

  const watFormatter = identedFormatter(2);

  const editorOptions: CodeMirror.EditorConfiguration = {
    theme: "eclipse",
    lineNumbers: true,
    tabSize: 2,
    lineWrapping: true
  };

  const outputArea = document.getElementById("emitted-wat") as HTMLTextAreaElement;
  const outputEditor = CodeMirror.fromTextArea(outputArea, {
    ...editorOptions,
    readOnly: true
  });

  const inputArea = document.getElementById("rockstar-source") as HTMLTextAreaElement;
  const inputEditor = CodeMirror.fromTextArea(inputArea, {
    ...editorOptions,
    autofocus: true
  });

  inputEditor.on("keyup", () => {
    const source = inputEditor.getValue();
    let output: string;
    try {
      output = rockstarToWat(source, watFormatter);
    } catch (err) {
      output = err.toString();
    }
    outputEditor.setValue(output);
  });

  inputEditor.setValue(initialRockstar.trim());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WabtModule().then((wabt: any) => {
    const wasmOutput = document.getElementById("wasm-output") as HTMLElement;

    const compileToWasm = (wat: string): void => {
      wasmOutput.innerHTML = "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let module: any;
      try {
        const features = {};
        module = wabt.parseWat("test.wast", wat, features);
        module.resolveNames();
        module.validate();

        // eslint-disable-next-line @typescript-eslint/camelcase
        const binaryOutput = module.toBinary({});
        wasmOutput.textContent = binaryOutput.log;

        const buffer = binaryOutput.buffer as BufferSource;
        WebAssembly.instantiate(buffer, {
          env: {
            print: (what: number): void => {
              wasmOutput.innerHTML = (wasmOutput.innerHTML || "") + what + "<br/>";
            },
            prompt: (): number => {
              let enteredNumber: number | null = null;
              while (enteredNumber === null || isNaN(enteredNumber)) {
                enteredNumber = parseInt(prompt("Please, enter an integer") || "", 10);
              }
              return enteredNumber;
            }
          }
        }).then(({ instance }) => {
          const main = instance.exports.main as Function;
          main();
        });
      } catch (e) {
        wasmOutput.textContent = e.toString();
      } finally {
        if (module) module.destroy();
      }
    };

    const wasmOutputSection = document.getElementById("wasm-output-section") as HTMLElement;
    wasmOutputSection.classList.remove("hidden");

    const compileToWasmButton = wasmOutputSection
      .getElementsByTagName("button")
      .item(0) as HTMLButtonElement;

    compileToWasmButton.addEventListener("click", () => compileToWasm(outputEditor.getValue()));
  });
})();
