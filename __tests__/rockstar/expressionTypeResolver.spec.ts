import { resolveExpressionType } from "../../src/rockstar/expressionTypeResolver";
import { Expression, Statement } from "../../src/rockstar/ast";
import {
  assignment,
  variable,
  number,
  string,
  mysterious,
  boolean,
  $null,
  variableDeclaration,
  pronoun,
  binaryExpression,
  functionCall,
  functionDeclaration
} from "./utils/ast-utils";

describe("rockstar", () => {
  describe("expression type resolver", () => {
    describe("literals", () => {
      it("resolves string expression", () => {
        const expression = string("hi");
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("string");
      });

      it("resolves integer expression", () => {
        const expression = number(5);
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("integer");
      });

      it("resolves float expression", () => {
        const expression = number(5.5);
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("float");
      });

      it("resolves boolean expression", () => {
        const expression = boolean(true);
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });

      it("resolves null expression", () => {
        const expression = $null;
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("null");
      });

      it("resolves mysterious expression", () => {
        const expression = mysterious;
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("mysterious");
      });
    });

    describe("variables", () => {
      it("resolves variable from assignment", () => {
        const expression = variable("hi");
        const scope: Statement[] = [assignment(variable("hi"), number(5))];
        const expressionType = resolveExpressionType(expression, scope, []);
        expect(expressionType).toEqual("integer");
      });

      it("resolves pronoun from assignment", () => {
        const expression = pronoun;
        const scope: Statement[] = [assignment(variable("hi"), number(5))];
        const expressionType = resolveExpressionType(expression, scope, []);
        expect(expressionType).toEqual("integer");
      });

      it("throws when resolvign variable and no variable assignment / declaration exists for this variable", () => {
        const expression = variable("hi");
        const scope: Statement[] = [assignment(variable("bla"), number(5))];
        expect(() => resolveExpressionType(expression, scope, [])).toThrow();
      });

      it("resolves variable from declaration", () => {
        const expression = variable("hi");
        const scope: Statement[] = [variableDeclaration(variable("hi"), number(5))];
        const expressionType = resolveExpressionType(expression, scope, []);
        expect(expressionType).toEqual("integer");
      });

      it("resolves pronoun from declaration", () => {
        const expression = pronoun;
        const scope: Statement[] = [variableDeclaration(variable("hi"), number(5))];
        const expressionType = resolveExpressionType(expression, scope, []);
        expect(expressionType).toEqual("integer");
      });

      it("throws when resolving pronoun and no variable assignment / declaration exists", () => {
        const expression = pronoun;
        expect(() => resolveExpressionType(expression, [], [])).toThrow();
      });
    });

    describe("arithmetic expressions", () => {
      it("1 + 2", () => {
        const expression: Expression = binaryExpression("add", number(1), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("integer");
      });

      it("1 + 2.5", () => {
        const expression: Expression = binaryExpression("add", number(1), number(2.5));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("float");
      });

      it("'str' + 2", () => {
        const expression: Expression = binaryExpression("add", string("str"), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("string");
      });

      it("'str' + null", () => {
        const expression: Expression = binaryExpression("add", string("str"), $null);
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("string");
      });

      it("'str' + mysterious", () => {
        const expression: Expression = binaryExpression("add", string("str"), mysterious);
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("string");
      });

      it("'str' + true", () => {
        const expression: Expression = binaryExpression("add", string("str"), boolean(true));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("string");
      });

      it("1 - 2", () => {
        const expression: Expression = binaryExpression("subtract", number(1), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("integer");
      });

      it("1 * 2", () => {
        const expression: Expression = binaryExpression("multiply", number(1), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("integer");
      });

      it("'str' * 2", () => {
        const expression: Expression = binaryExpression("multiply", string("str"), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("string");
      });

      it("1 / 2", () => {
        const expression: Expression = binaryExpression("divide", number(1), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("integer");
      });
    });

    describe("logical expressions", () => {
      it("1 && 2", () => {
        const expression: Expression = binaryExpression("and", number(1), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });

      it("1 || 2", () => {
        const expression: Expression = binaryExpression("or", number(1), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });
    });

    describe("comparison expressions", () => {
      it("1 == 2", () => {
        const expression: Expression = binaryExpression("equals", number(1), number(2));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });

      it("1 <= 'str'", () => {
        const expression: Expression = binaryExpression(
          "lowerThanOrEquals",
          number(1),
          string("str")
        );
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });

      it("null > 'str'", () => {
        const expression: Expression = binaryExpression("greaterThan", $null, string("str"));
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });

      it("null >= mysterious", () => {
        const expression: Expression = binaryExpression("greaterThanOrEquals", $null, mysterious);
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });

      it("true < mysterious", () => {
        const expression: Expression = binaryExpression("lowerThan", $null, mysterious);
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });
    });

    describe("function calls", () => {
      it("return always integer", () => {
        const fn = functionDeclaration("hello", [variable("x")], variable("x"), []);
        const expression: Expression = functionCall("hello", [number(10)]);
        const expressionType = resolveExpressionType(expression, [], [fn]);
        expect(expressionType).toEqual("integer");
      });
    });

    describe("complex expressions", () => {
      it("1 || 2 - 5", () => {
        const expression: Expression = binaryExpression(
          "or",
          number(1),
          binaryExpression("subtract", number(2), number(5))
        );
        const expressionType = resolveExpressionType(expression, [], []);
        expect(expressionType).toEqual("boolean");
      });
    });
  });
});
