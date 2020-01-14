import { parse } from "../../../src/rockstar/parser";
import { NamedVariable, ArithmeticRoundingOperation } from "../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("arithmetic rounding", () => {
      type Cases = { [operation: string]: { variable: [string, string][]; pronoun: string[] } };
      const cases: Cases = {
        upOrDown: {
          variable: [
            ["Turn round X", "x"],
            ["Turn around X", "x"]
          ],
          pronoun: ["Turn her around.", "Turn them round."]
        },
        up: {
          variable: [["Turn up X", "x"]],
          pronoun: ["Turn it up", "Turn it up."]
        },
        down: {
          variable: [["Turn down X", "x"]],
          pronoun: ["Turn it down", "Turn it down."]
        }
      };
      for (const direction of Object.keys(cases)) {
        describe(`round ${direction} variable`, () => {
          for (const [expression, variable] of cases[direction].variable) {
            it(expression, () => {
              const ast = parse(expression);

              expect(ast.length).toEqual(1);
              expect(ast[0].type).toEqual("round");

              const firstNode = ast[0] as ArithmeticRoundingOperation;
              expect(firstNode.direction).toEqual(direction);
              expect(firstNode.target.type).toEqual("variable");
              expect((firstNode.target as NamedVariable).name).toEqual(variable);
            });
          }
        });

        describe(`round ${direction} pronoun`, () => {
          for (const expression of cases[direction].pronoun) {
            it(expression, () => {
              const ast = parse(expression);

              expect(ast.length).toEqual(1);
              expect(ast[0].type).toEqual("round");

              const firstNode = ast[0] as ArithmeticRoundingOperation;
              expect(firstNode.direction).toEqual(direction);
              expect(firstNode.target.type).toEqual("pronoun");
            });
          }
        });
      }
    });
  });
});
