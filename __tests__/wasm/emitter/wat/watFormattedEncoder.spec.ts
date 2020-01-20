import { watIdentedVectorEncoder } from "../../../../src/wasm/emitter";

describe("wasm", () => {
  describe("watIdentedVectorEncoder", () => {
    it("encodes simple data", () => {
      const encodeVector = watIdentedVectorEncoder(2);
      const result = encodeVector("top");
      expect(result).toEqual("top");
    });

    it("joins single-line statements", () => {
      const encodeVector = watIdentedVectorEncoder(2);
      const result = encodeVector("top", "body");
      expect(result).toEqual("(top body)");
    });

    it("encodes module's statements on a new line", () => {
      const formatter = watIdentedVectorEncoder(2);
      const result = formatter("module", "one", "two");
      expect(result).toEqual("(module\n  one\n  two\n)");
    });

    it("encodes function with params, with result, with instructions", () => {
      const encodeVector = watIdentedVectorEncoder(2);
      const result = encodeVector(
        "func",
        "$func",
        encodeVector("param", "f32"),
        encodeVector("param", "f32"),
        encodeVector("result", "f32"),
        encodeVector("call", "$x")
      );
      expect(result).toEqual("(func $func (param f32) (param f32) (result f32)\n  (call $x)\n)");
    });

    it("encodes function without params, with result, with instructions", () => {
      const encodeVector = watIdentedVectorEncoder(2);
      const result = encodeVector(
        "func",
        "$func",
        encodeVector("result", "f32"),
        encodeVector("call", "$x")
      );
      expect(result).toEqual("(func $func (result f32)\n  (call $x)\n)");
    });

    it("encodes function with params, without result, with instructions", () => {
      const encodeVector = watIdentedVectorEncoder(2);
      const result = encodeVector(
        "func",
        "$func",
        encodeVector("param", "f32"),
        encodeVector("param", "f32"),
        encodeVector("call", "$x")
      );
      expect(result).toEqual("(func $func (param f32) (param f32)\n  (call $x)\n)");
    });

    it("encodes function with params, with result, without instructions", () => {
      const encodeVector = watIdentedVectorEncoder(2);
      const result = encodeVector(
        "func",
        "$func",
        encodeVector("param", "f32"),
        encodeVector("param", "f32"),
        encodeVector("result", "f32")
      );
      expect(result).toEqual("(func $func (param f32) (param f32) (result f32))");
    });

    it("nests a function within a module", () => {
      const encodeVector = watIdentedVectorEncoder(2);
      const result = encodeVector(
        "module",
        encodeVector(
          "func",
          "$func",
          encodeVector("param", "f32"),
          encodeVector("result", "f32"),
          encodeVector("call", "$x")
        )
      );
      expect(result).toEqual(
        "(module\n  (func $func (param f32) (result f32)\n    (call $x)\n  )\n)"
      );
    });
  });
});
