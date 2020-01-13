import { parse } from "../../../src/rockstar/parser";
import { Comment } from "../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("comments", () => {
      it("parses comment", () => {
        const ast = parse("(Initialise Tommy = 1337)");

        expect(ast.length).toEqual(1);

        const node = ast[0] as Comment;
        expect(node.comment).toEqual("Initialise Tommy = 1337");
      });
    });
  });
});
