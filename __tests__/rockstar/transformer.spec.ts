import { transform } from "../../src/rockstar/transformer";
import { parse, FunctionDeclarationNode } from "../../src/rockstar/parser";

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

      // We put all global stamements in main
      expect(transformedAst.length).toEqual(1);

      const fnNode = transformedAst[0] as FunctionDeclarationNode;
      expect(fnNode.name).toEqual("main");
    });
  });
});
