import { parse } from "../../../src/rockstar/parser";
import { RoundOperation, Variable, ArithmeticRoundingOperation } from "../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("arithmetic rounding", () => {
      type Cases = { [operation: string]: { variable: [string, string][]; pronoun: string[] } };
      const cases: Cases = {
        round: {
          variable: [
            ["Turn round X", "x"],
            ["Turn around X", "x"]
          ],
          pronoun: ["Turn her around.", "Turn them round."]
        },
        roundUp: {
          variable: [["Turn up X", "x"]],
          pronoun: ["Turn it up", "Turn it up."]
        },
        roundDown: {
          variable: [["Turn down X", "x"]],
          pronoun: ["Turn it down", "Turn it down."]
        }
      };
      for (const operation of Object.keys(cases)) {
        describe(`${operation} variable`, () => {
          for (const [expression, variable] of cases[operation].variable) {
            it(expression, () => {
              const ast = parse(expression);

              expect(ast.length).toEqual(1);
              expect(ast[0].type).toEqual(operation);

              const firstNode = ast[0] as RoundOperation;
              expect(firstNode.target.type).toEqual("variable");
              expect((firstNode.target as Variable).name).toEqual(variable);
            });
          }
        });

        describe(`${operation} pronoun`, () => {
          for (const expression of cases[operation].pronoun) {
            it(expression, () => {
              const ast = parse(expression);

              expect(ast.length).toEqual(1);
              expect(ast[0].type).toEqual(operation);

              const firstNode = ast[0] as ArithmeticRoundingOperation;
              expect(firstNode.target.type).toEqual("pronoun");
            });
          }
        });
      }
    });
  });
});
