import { parse } from "../../../../src/rockstar/parser";
import { Assignment, ArithmeticOperator, BinaryExpression } from "../../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("assignments", () => {
      describe("assignments with number literals", () => {
        type Case = [string, string, number];
        type Cases = Case[];
        const cases: Cases = [
          ["Put 5 into X", "x", 5],
          ["Let my balance be 1000000", "my balance", 1000000]
        ];
        for (const [source, target, number] of cases) {
          it(source, () => {
            const { statements } = parse(source);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("assignment");

            const node = statements[0] as Assignment;
            expect(node.target).toEqual({ type: "variable", name: target });
            expect(node.expression).toEqual({ type: "number", value: number });
          });
        }
      });

      describe("assignments with string literals", () => {
        type Case = [string, string, string];
        type Cases = Case[];
        const cases: Cases = [
          ['Put "Hello San Francisco" into the message', "the message", "Hello San Francisco"],
          ['Let my day be "heeeellooo"', "my day", "heeeellooo"]
        ];
        for (const [source, target, str] of cases) {
          it(source, () => {
            const { statements } = parse(source);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("assignment");

            const node = statements[0] as Assignment;
            expect(node.target).toEqual({ type: "variable", name: target });
            expect(node.expression).toEqual({ type: "string", value: str });
          });
        }
      });

      describe("assignments with arithmetic expressions", () => {
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
        for (const [source, target, lhs, rhs, operator] of cases) {
          it(source, () => {
            const { statements } = parse(source);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("assignment");

            const node = statements[0] as Assignment;
            expect(node.target).toEqual({ type: "variable", name: target });
            expect(node.expression.type).toEqual("binaryExpression");

            const expression = node.expression as BinaryExpression;
            expect(expression.operator).toEqual(operator);
            expect(expression.lhs).toEqual({ type: "variable", name: lhs });
            expect(expression.rhs).toEqual({ type: "variable", name: rhs });
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
          for (const [source, target, operator, number] of cases) {
            it(source, () => {
              const { statements } = parse(source);

              expect(statements.length).toEqual(1);
              expect(statements[0].type).toEqual("assignment");

              const node = statements[0] as Assignment;
              expect(node.target).toEqual({ type: "variable", name: target });
              expect(node.expression.type).toEqual("binaryExpression");

              const expression = node.expression as BinaryExpression;
              expect(expression.operator).toEqual(operator);
              expect(expression.lhs).toEqual({ type: "variable", name: target });
              expect(expression.rhs).toEqual({ type: "number", value: number });
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
          for (const [source, target, operator, variable] of cases) {
            it(source, () => {
              const { statements } = parse(source);

              expect(statements.length).toEqual(1);
              expect(statements[0].type).toEqual("assignment");

              const node = statements[0] as Assignment;
              expect(node.target).toEqual({ type: "variable", name: target });
              expect(node.expression.type).toEqual("binaryExpression");

              const expression = node.expression as BinaryExpression;
              expect(expression.operator).toEqual(operator);
              expect(expression.lhs).toEqual({ type: "variable", name: target });
              expect(expression.rhs).toEqual({ type: "variable", name: variable });
            });
          }
        });
      });

      describe("function calls", () => {
        it("Put Multiply taking the cat into Large", () => {
          const source = "Put Multiply taking the cat into Large";
          const { statements } = parse(source);

          expect(statements).toEqual([
            {
              type: "assignment",
              target: {
                type: "variable",
                name: "large"
              },
              expression: {
                type: "functionCall",
                name: "multiply",
                args: [{ type: "variable", name: "the cat" }]
              }
            }
          ]);
        });

        it('Put Multiply taking "yo yo" into Large', () => {
          const source = 'Put Multiply taking "yo yo" into Large';
          const { statements } = parse(source);

          expect(statements).toEqual([
            {
              type: "assignment",
              target: {
                type: "variable",
                name: "large"
              },
              expression: {
                type: "functionCall",
                name: "multiply",
                args: [{ type: "string", value: "yo yo" }]
              }
            }
          ]);
        });

        it("Put Multiply taking 3 into Large", () => {
          const source = "Put Multiply taking 3 into Large";
          const { statements } = parse(source);

          expect(statements).toEqual([
            {
              type: "assignment",
              target: {
                type: "variable",
                name: "large"
              },
              expression: {
                type: "functionCall",
                name: "multiply",
                args: [{ type: "number", value: 3 }]
              }
            }
          ]);
        });

        it("Put Multiply taking 3, 5 into Large", () => {
          const source = "Put Multiply taking 3, 5 into Large";
          const { statements } = parse(source);

          expect(statements).toEqual([
            {
              type: "assignment",
              target: {
                type: "variable",
                name: "large"
              },
              expression: {
                type: "functionCall",
                name: "multiply",
                args: [
                  { type: "number", value: 3 },
                  { type: "number", value: 5 }
                ]
              }
            }
          ]);
        });
      });
    });
  });
});
