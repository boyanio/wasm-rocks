import { withIdentation } from "../../../src/wasm/emitter";

describe("wasm", () => {
  describe("watFormatter", () => {
    describe("identation", () => {
      it("formats simple data", () => {
        const formatter = withIdentation(2);
        const result = formatter("top");
        expect(result).toEqual("top");
      });

      it("joins single-line statements", () => {
        const formatter = withIdentation(2);
        const result = formatter("top", "body");
        expect(result).toEqual("(top body)");
      });

      it("formats module's statements on a new line", () => {
        const formatter = withIdentation(2);
        const result = formatter("module", "one", "two");
        expect(result).toEqual("(module\n  one\n  two\n)");
      });

      it("formats function with params, with result, with instructions", () => {
        const formatter = withIdentation(2);
        const result = formatter(
          "func",
          "$func",
          formatter("param", "f32"),
          formatter("param", "f32"),
          formatter("result", "f32"),
          formatter("call", "$x")
        );
        expect(result).toEqual("(func $func (param f32) (param f32) (result f32)\n  (call $x)\n)");
      });

      it("formats function without params, with result, with instructions", () => {
        const formatter = withIdentation(2);
        const result = formatter(
          "func",
          "$func",
          formatter("result", "f32"),
          formatter("call", "$x")
        );
        expect(result).toEqual("(func $func (result f32)\n  (call $x)\n)");
      });

      it("formats function with params, without result, with instructions", () => {
        const formatter = withIdentation(2);
        const result = formatter(
          "func",
          "$func",
          formatter("param", "f32"),
          formatter("param", "f32"),
          formatter("call", "$x")
        );
        expect(result).toEqual("(func $func (param f32) (param f32)\n  (call $x)\n)");
      });

      it("formats function with params, with result, without instructions", () => {
        const formatter = withIdentation(2);
        const result = formatter(
          "func",
          "$func",
          formatter("param", "f32"),
          formatter("param", "f32"),
          formatter("result", "f32")
        );
        expect(result).toEqual("(func $func (param f32) (param f32) (result f32))");
      });

      it("nests a function within a module", () => {
        const formatter = withIdentation(2);
        const result = formatter(
          "module",
          formatter(
            "func",
            "$func",
            formatter("param", "f32"),
            formatter("result", "f32"),
            formatter("call", "$x")
          )
        );
        expect(result).toEqual(
          "(module\n  (func $func (param f32) (result f32)\n    (call $x)\n  )\n)"
        );
      });
    });
  });
});
