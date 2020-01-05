import {
  parse,
  CommentNode,
  VariableDeclarationNode,
  NumberLiteralNode,
  StringLiteralNode
} from "../../src/rockstar/parse";

describe("rockstar", () => {
  describe("parse", () => {
    describe("comments", () => {
      it("parses comment", () => {
        const ast = parse("(Initialise Tommy = 1337)");

        expect(ast.length).toEqual(1);
        expect(ast[0].type).toEqual("comment");

        const node = ast[0] as CommentNode;
        expect(node.value).toEqual("Initialise Tommy = 1337");
      });
    });

    describe("variables", () => {
      const cases = [
        ["Variable is 1", "variable", "numberLiteral", 1],
        ["Tommy is a rockstar", "tommy", "stringLiteral", "a rockstar"],
        ["My boy is 5", "my boy", "numberLiteral", 5],
        ["A boy is 5", "a boy", "numberLiteral", 5],
        ["YoUr boy is 5", "your boy", "numberLiteral", 5],
        ["aN applE is 5", "an apple", "numberLiteral", 5],
        ["The lady is very nice", "the lady", "stringLiteral", "very nice"],
        ["COOL LadY is very nice", "Cool Lady", "stringLiteral", "very nice"],
        ["Doctor Feelgood is 10", "Doctor Feelgood", "numberLiteral", 10]
      ];
      for (const [input, name, type, value] of cases) {
        it(`parses common variable: ${input}`, () => {
          const ast = parse(input as string);

          expect(ast.length).toEqual(1);
          expect(ast[0].type).toEqual("variableDeclaration");

          const node = ast[0] as VariableDeclarationNode;
          expect(node.name).toEqual(name);
          expect(node.expression.type).toEqual(type);

          const expression = node.expression as StringLiteralNode;
          expect(expression.value).toEqual(value);
        });
      }
    });
  });
});
