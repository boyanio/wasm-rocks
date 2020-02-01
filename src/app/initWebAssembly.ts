const decodeString = (heap: Uint8Array, offset: number): string => {
  let s = "";
  for (let i = offset; heap[i]; i++) {
    s += String.fromCharCode(heap[i]);
  }
  return s;
};

export function initWebAssembly(
  buffer: BufferSource,
  setOutput: (value: string) => void
): Promise<void> {
  let output = "";
  setOutput("");

  let heap: Uint8Array | null = null;
  return WebAssembly.instantiate(buffer, {
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
  }).then(
    ({ instance }) => {
      heap = new Uint8Array((instance.exports.memory as WebAssembly.Memory).buffer);
      const main = instance.exports.main as Function;
      main();
    },
    e => {
      setOutput(e.toString());
    }
  );
}
