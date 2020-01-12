import { noFormat, emitWat } from "../../../src/wasm/emitter";

describe("wasm", () => {
  describe("watEmitter", () => {
    describe("memories", () => {
      it("emits memory with min", () => {
        const wat = emitWat(noFormat(), {
          memories: [{ id: "$0", memoryType: { minSize: 1 } }]
        });
        expect(wat).toEqual("(module (memory $0 1))");
      });

      it("emits memory with min and max", () => {
        const wat = emitWat(noFormat(), {
          memories: [{ id: "$0", memoryType: { minSize: 1, maxSize: 2 } }]
        });
        expect(wat).toEqual("(module (memory $0 1 2))");
      });
    });

    describe("imports", () => {
      it("emits memory import", () => {
        const wat = emitWat(noFormat(), {
          imports: [
            {
              module: "env",
              name: "memory",
              importType: { name: "memory", id: "$0", memoryType: { minSize: 1, maxSize: 2 } }
            }
          ]
        });
        expect(wat).toEqual('(module (import "env" "memory" (memory $0 1 2)))');
      });

      it("emits function import", () => {
        const wat = emitWat(noFormat(), {
          imports: [
            {
              module: "env",
              name: "hello",
              importType: {
                name: "func",
                id: "$hello",
                functionType: { params: ["f32", "f32"], result: "f32" }
              }
            }
          ]
        });
        expect(wat).toEqual(
          '(module (import "env" "hello" (func $hello (param f32) (param f32) (result f32))))'
        );
      });
    });

    describe("exports", () => {
      it("emits memory export", () => {
        const wat = emitWat(noFormat(), {
          exports: [{ name: "memory", id: "$0", exportType: "memory" }]
        });
        expect(wat).toEqual('(module (export "memory" (memory $0)))');
      });

      it("emits function export", () => {
        const wat = emitWat(noFormat(), {
          exports: [{ name: "hello", id: "$hello", exportType: "func" }]
        });
        expect(wat).toEqual('(module (export "hello" (func $hello)))');
      });
    });
  });
});
