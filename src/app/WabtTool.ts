// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const WabtModule: any;

const decodeString = (heap: Uint8Array, offset: number): string => {
  let s = "";
  for (let i = offset; heap[i]; i++) {
    s += String.fromCharCode(heap[i]);
  }
  return s;
};

export interface WabtWrapper {
  compileToWasm(wat: string): void;
}

export function initializeWabt(setOutput: (value: string) => void): Promise<WabtWrapper> {
  return new Promise(resolve => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WabtModule().then((wabt: any) => {
      const wabtWrapper: WabtWrapper = {
        compileToWasm(wat: string): void {
          let output = "";
          setOutput("");

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let module: any;
          try {
            const features = {};
            module = wabt.parseWat("test.wast", wat, features);
            module.resolveNames();
            module.validate();

            const binaryOutput = module.toBinary({});
            setOutput(binaryOutput.log);

            let heap: Uint8Array | null = null;
            const buffer = binaryOutput.buffer as BufferSource;
            WebAssembly.instantiate(buffer, {
              env: {
                printNumber: (what: number): void => {
                  output += what + "<br/>";
                  setOutput(output);
                },
                printString: (offset: number): void => {
                  let what: string;
                  if (!heap) {
                    what = "Error: The WebAssembly heap is not exported";
                  } else {
                    what = decodeString(heap as Uint8Array, offset);
                  }
                  output += what + "<br/>";
                  setOutput(output);
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
              heap = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer);
              const main = instance.exports.main as Function;
              main();
            });
          } catch (e) {
            setOutput(e.toString());
          } finally {
            if (module) module.destroy();
          }
        }
      };
      resolve(wabtWrapper);
    });
  });
}
