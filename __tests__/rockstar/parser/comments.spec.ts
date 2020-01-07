import { parse, Comment } from "../../../src/rockstar/parser";

describe("rockstar", () => {
  describe("parser", () => {
    describe("comments", () => {
      it("parses comment", () => {
        const ast = parse("(Initialise Tommy = 1337)");

        expect(ast.length).toEqual(1);

        const node = ast[0] as Comment;
        expect(node.value).toEqual("Initialise Tommy = 1337");
      });
    });
  });
});
