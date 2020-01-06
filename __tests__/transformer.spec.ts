import { transform } from "../src/rockstar/transformer";
import { parse, FunctionDeclarationNode } from "../src/rockstar/parser";

describe("rockstar", () => {
  describe("transformer", () => {
    it("creates a main function with global statements, if none", () => {
      const code = `
      X is 5
      Turn it up.
      Shout it.
      `;
      const ast = parse(code);
      const transformedAst = transform(ast);

      const mainFnNodes = transformedAst.filter(
        x => x.type === "function" && (<FunctionDeclarationNode>x).name === "main"
      );
      expect(mainFnNodes.length).toEqual(1);
    });
  });
});
