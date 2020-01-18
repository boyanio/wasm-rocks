import { parse } from "../../../../src/rockstar/parser";
import { IncrementOperation, DecrementOperation } from "../../../../src/rockstar/ast";

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
      for (const [source, variable, times] of cases) {
        it(source, () => {
          const { statements } = parse(source);

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("increment");

          const node = statements[0] as IncrementOperation;
          expect(node.target).toEqual({ type: "variable", name: variable });
          expect(node.times).toEqual(times);
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

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("decrement");

          const node = statements[0] as DecrementOperation;
          expect(node.target).toEqual({ type: "variable", name: variable });
          expect(node.times).toEqual(times);
        });
      }
    });
  });
});
