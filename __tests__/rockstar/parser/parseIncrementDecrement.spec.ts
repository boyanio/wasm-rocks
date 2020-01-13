import { parse } from "../../../src/rockstar/parser";
import { IncrementOperation, DecrementOperation, Variable } from "../../../src/rockstar/ast";

type Case = [string, string, number];
type Cases = Case[];

describe("rockstar", () => {
  describe("parser", () => {
    describe("increment variable", () => {
      const cases: Cases = [
        ["Build my world up", "my world", 1],
        ["Build my world up, up", "my world", 2],
        ["Build my world up up", "my world", 2]
      ];
      for (const [expression, variable, times] of cases) {
        it(expression, () => {
          const ast = parse(expression);

          expect(ast.length).toEqual(times);

          for (let i = 0; i < times; i++) {
            expect(ast[i].type).toEqual("increment");

            const node = ast[i] as IncrementOperation;
            expect(node.target.type).toEqual("variable");
            expect((node.target as Variable).name).toEqual(variable);
          }
        });
      }
    });

    describe("decrement variable", () => {
      const cases: Cases = [
        ["Knock the walls down", "the walls", 1],
        ["Knock the walls down, down", "the walls", 2],
        ["Knock the walls down down", "the walls", 2]
      ];
      for (const [expression, variable, times] of cases) {
        it(expression, () => {
          const ast = parse(expression);

          expect(ast.length).toEqual(times);

          for (let i = 0; i < times; i++) {
            expect(ast[i].type).toEqual("decrement");

            const node = ast[i] as IncrementOperation;
            expect(node.target.type).toEqual("variable");
            expect((node.target as Variable).name).toEqual(variable);
          }
        });
      }
    });
  });
});
