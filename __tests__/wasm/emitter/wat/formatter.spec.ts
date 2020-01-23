import { identedFormatter } from "../../../../src/wasm/emitter";

describe("wasm", () => {
  describe("emitter", () => {
    describe("wat", () => {
      describe("formatter", () => {
        it("formats simple data", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector(["top"]);
          expect(result).toEqual("top");
        });

        it("joins single-line statements", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector(["top", "body"]);
          expect(result).toEqual("(top body)");
        });

        it("formats module's statements on a new line", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector(["module", ["one"], ["two"]]);
          expect(result).toEqual("(module\n  one\n  two\n)");
        });

        it("imports go on a single line", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector([
            "module",
            ["import", '"env"', '"memory"', ["memory", "$memory"]],
            ["func", "$func"]
          ]);
          expect(result).toEqual(
            '(module\n  (import "env" "memory" (memory $memory))\n  (func $func)\n)'
          );
        });

        it("exports go on a single line", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector([
            "module",
            ["func", "$func"],
            ["export", '"memory"', ["memory", "$memory"]]
          ]);
          expect(result).toEqual(
            '(module\n  (func $func)\n  (export "memory" (memory $memory))\n)'
          );
        });

        it("formats function with params, with result, with instructions", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector([
            "func",
            "$func",
            ["param", "f32"],
            ["param", "f32"],
            ["result", "f32"],
            ["call", "$x"]
          ]);
          expect(result).toEqual(
            "(func $func (param f32) (param f32) (result f32)\n  (call $x)\n)"
          );
        });

        it("formats function without params, with result, with instructions", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector(["func", "$func", ["result", "f32"], ["call", "$x"]]);
          expect(result).toEqual("(func $func (result f32)\n  (call $x)\n)");
        });

        it("formats function with params, without result, with instructions", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector([
            "func",
            "$func",
            ["param", "f32"],
            ["param", "f32"],
            ["call", "$x"]
          ]);
          expect(result).toEqual("(func $func (param f32) (param f32)\n  (call $x)\n)");
        });

        it("formats function with params, with result, without instructions", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector([
            "func",
            "$func",
            ["param", "f32"],
            ["param", "f32"],
            ["result", "f32"]
          ]);
          expect(result).toEqual("(func $func (param f32) (param f32) (result f32)\n)");
        });

        it("nests a function within a module", () => {
          const encodeVector = identedFormatter(2);
          const result = encodeVector([
            "module",
            ["func", "$func", ["param", "f32"], ["result", "f32"], ["call", "$x"]]
          ]);
          expect(result).toEqual(
            "(module\n  (func $func (param f32) (result f32)\n    (call $x)\n  )\n)"
          );
        });
      });
    });
  });
});
