import { withIdentation } from "../../../src/wasm/emitter";

describe("wasm", () => {
  describe("watFormatter", () => {
    describe("identation", () => {
      it("formats header on a single line", () => {
        const formatter = withIdentation(2);
        const result = formatter("hi");
        expect(result).toEqual("(hi)");
      });

      it("adds single identation to the body", () => {
        const formatter = withIdentation(1);
        const result = formatter("hi", ["body1"]);
        expect(result).toEqual("(hi\n body1\n)");
      });

      it("adds double identation to the body", () => {
        const formatter = withIdentation(2);
        const result = formatter("hi", ["body1"]);
        expect(result).toEqual("(hi\n  body1\n)");
      });

      it("nests identation for inner formatted body", () => {
        const formatter = withIdentation(2);
        const result = formatter("top", [formatter("body", ["child"])]);
        expect(result).toEqual("(top\n  (body\n    child\n  )\n)");
      });
    });
  });
});
