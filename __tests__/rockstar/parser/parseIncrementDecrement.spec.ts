import { parse } from "../../../src/rockstar/parser";
import { IncrementOperation, DecrementOperation, NamedVariable } from "../../../src/rockstar/ast";

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
          const { statements } = parse(expression);

          expect(statements.length).toEqual(times);

          for (let i = 0; i < times; i++) {
            expect(statements[i].type).toEqual("increment");

            const node = statements[i] as IncrementOperation;
            expect(node.target.type).toEqual("variable");
            expect((node.target as NamedVariable).name).toEqual(variable);
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
          const { statements } = parse(expression);

          expect(statements.length).toEqual(times);

          for (let i = 0; i < times; i++) {
            expect(statements[i].type).toEqual("decrement");

            const node = statements[i] as DecrementOperation;
            expect(node.target.type).toEqual("variable");
            expect((node.target as NamedVariable).name).toEqual(variable);
          }
        });
      }
    });
  });
});
