import { parse } from "../../../src/rockstar/parser";
import {
  SimpleAssignment,
  NamedVariable,
  NumberLiteral,
  StringLiteral,
  ArithmeticOperator,
  ArithmeticExpression,
  CompoundAssignment
} from "../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("assignments", () => {
      describe("simple assignments with number literals", () => {
        type Case = [string, string, number];
        type Cases = Case[];
        const cases: Cases = [
          ["Put 5 into X", "x", 5],
          ["Let my balance be 1000000", "my balance", 1000000]
        ];
        for (const [expression, target, literal] of cases) {
          it(expression, () => {
            const { statements } = parse(expression);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("simpleAssignment");

            const node = statements[0] as SimpleAssignment;
            expect(node.target.type).toEqual("variable");
            expect((node.target as NamedVariable).name).toEqual(target);
            expect(node.expression.type).toEqual("number");
            expect((node.expression as NumberLiteral).value).toEqual(literal);
          });
        }
      });

      describe("simple assignments with string literals", () => {
        type Case = [string, string, string];
        type Cases = Case[];
        const cases: Cases = [
          ['Put "Hello San Francisco" into the message', "the message", "Hello San Francisco"],
          ['Let my day be "heeeellooo"', "my day", "heeeellooo"]
        ];
        for (const [expression, target, literal] of cases) {
          it(expression, () => {
            const { statements } = parse(expression);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("simpleAssignment");

            const node = statements[0] as SimpleAssignment;
            expect(node.target.type).toEqual("variable");
            expect((node.target as NamedVariable).name).toEqual(target);
            expect(node.expression.type).toEqual("string");
            expect((node.expression as StringLiteral).value).toEqual(literal);
          });
        }
      });

      describe("simple assignments with arithmetic expressions", () => {
        type Case = [string, string, string, string, ArithmeticOperator];
        type Cases = Case[];
        const cases: Cases = [
          [
            "Let the survivors be the brave without the fallen",
            "the survivors",
            "the brave",
            "the fallen",
            "subtract"
          ],
          ["Put here minus there into my hands", "my hands", "here", "there", "subtract"],
          ["Put here plus there into my hands", "my hands", "here", "there", "add"],
          ["Put here with there into my hands", "my hands", "here", "there", "add"],
          [
            "Put the whole of your heart into my hands",
            "my hands",
            "the whole",
            "your heart",
            "multiply"
          ],
          ["Put here times there into my hands", "my hands", "here", "there", "multiply"],
          ["Put my heart over the moon into my hands", "my hands", "my heart", "the moon", "divide"]
        ];
        for (const [expression, target, left, right, operator] of cases) {
          it(expression, () => {
            const { statements } = parse(expression);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("simpleAssignment");

            const node = statements[0] as SimpleAssignment;
            expect(node.target.type).toEqual("variable");
            expect((node.target as NamedVariable).name).toEqual(target);

            expect(node.expression.type).toEqual("arithmeticExpression");

            const arithmeticExpression = node.expression as ArithmeticExpression;
            expect(arithmeticExpression.operator).toEqual(operator);
            expect(arithmeticExpression.left.type).toEqual("variable");
            expect((arithmeticExpression.left as NamedVariable).name).toEqual(left);
            expect(arithmeticExpression.right.type).toEqual("variable");
            expect((arithmeticExpression.right as NamedVariable).name).toEqual(right);
          });
        }
      });

      describe("compound assignments", () => {
        describe("compound assignments to number literals", () => {
          type Case = [string, string, ArithmeticOperator, number];
          type Cases = Case[];
          const cases: Cases = [
            ["Let X be times 10", "x", "multiply", 10],
            ["Let X be of 10", "x", "multiply", 10],
            ["Let X be with 10", "x", "add", 10],
            ["Let X be plus 10", "x", "add", 10],
            ["Let X be minus 10", "x", "subtract", 10],
            ["Let X be without 10", "x", "subtract", 10],
            ["Let X be over 10", "x", "divide", 10]
          ];
          for (const [expression, target, operator, number] of cases) {
            it(expression, () => {
              const { statements } = parse(expression);

              expect(statements.length).toEqual(1);
              expect(statements[0].type).toEqual("compoundAssignment");

              const node = statements[0] as CompoundAssignment;
              expect(node.target.type).toEqual("variable");
              expect((node.target as NamedVariable).name).toEqual(target);
              expect(node.operator).toEqual(operator);
              expect(node.right.type).toEqual("number");
              expect((node.right as NumberLiteral).value).toEqual(number);
            });
          }
        });

        describe("compound assignments to variables", () => {
          type Case = [string, string, ArithmeticOperator, string];
          type Cases = Case[];
          const cases: Cases = [
            ["Let the children be with fear", "the children", "add", "fear"],
            ["Let the children be plus fear", "the children", "add", "fear"],
            ["Let the children be minus fear", "the children", "subtract", "fear"],
            ["Let the children be without fear", "the children", "subtract", "fear"],
            ["Let the children be times fear", "the children", "multiply", "fear"],
            ["Let the children be of fear", "the children", "multiply", "fear"],
            ["Let my heart be over the moon", "my heart", "divide", "the moon"]
          ];
          for (const [expression, target, operator, variable] of cases) {
            it(expression, () => {
              const { statements } = parse(expression);

              expect(statements.length).toEqual(1);
              expect(statements[0].type).toEqual("compoundAssignment");

              const node = statements[0] as CompoundAssignment;
              expect(node.target.type).toEqual("variable");
              expect((node.target as NamedVariable).name).toEqual(target);
              expect(node.operator).toEqual(operator);
              expect(node.right.type).toEqual("variable");
              expect((node.right as NamedVariable).name).toEqual(variable);
            });
          }
        });
      });
    });
  });
});
