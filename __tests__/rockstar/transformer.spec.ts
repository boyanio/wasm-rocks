import { transform } from "../../src/rockstar/transformer";
import {
  parse,
  FunctionDeclarationNode,
  Program,
  AssignmentNode,
  ExplicitIdentifierNode,
  NumberLiteralNode,
  ImplicitIdentifierNode
} from "../../src/rockstar/parser";

describe("rockstar", () => {
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

      const fnNode = transformedAst[0] as FunctionDeclarationNode;
      expect(fnNode.name).toEqual("main");
    });

    it("throws if there are global statements and a main function", () => {
      const ast: Program = [
        new AssignmentNode(new ExplicitIdentifierNode("x"), new NumberLiteralNode(5)),
        new FunctionDeclarationNode("main", [], new ImplicitIdentifierNode(), [
          new AssignmentNode(new ExplicitIdentifierNode("y"), new NumberLiteralNode(5))
        ])
      ];
      expect(() => transform(ast)).toThrow();
    });
  });
});
