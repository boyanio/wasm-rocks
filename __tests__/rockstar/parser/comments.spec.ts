import { parse } from "../../../src/rockstar/parser";

describe("rockstar", () => {
  describe("parse", () => {
    describe("comments", () => {
      it("parses comment", () => {
        const ast = parse("(Initialise Tommy = 1337)");

        expect(ast.length).toEqual(1);
        expect(ast[0].toString()).toEqual('comment { value = "Initialise Tommy = 1337" }');
      });
    });
  });
});
