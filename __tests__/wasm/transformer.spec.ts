import { transform } from "../../src/wasm/transformer";
import {
  parse,
  FunctionDeclaration,
  Program,
  Assignment,
  Variable,
  NumberLiteral,
  Pronoun
} from "../../src/rockstar/parser";

describe("wasm", () => {
  describe("transformer", () => {
    it("creates a main function with global statements, if none exists", () => {
      const code = `
      X is 5
      Turn it up.
      Shout it.
      `;
      const ast = parse(code);
      const transformedAst = transform(ast);

      // We put all global stamements in main
      expect(transformedAst.length).toEqual(1);

      const fnNode = transformedAst[0] as FunctionDeclaration;
      expect(fnNode.name).toEqual("main");
    });

    it("throws if there are global statements and a main function", () => {
      const ast: Program = [
        new Assignment(new Variable("x"), new NumberLiteral(5)),
        new FunctionDeclaration("main", [], new Pronoun(), [
          new Assignment(new Variable("y"), new NumberLiteral(5))
        ])
      ];
      expect(() => transform(ast)).toThrow();
    });
  });
});
