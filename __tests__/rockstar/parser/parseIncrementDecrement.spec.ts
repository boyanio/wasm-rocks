import { parse, IncrementOperation, DecrementOperation } from "../../../src/rockstar/parser";

type Case = [string, string, number];
type Cases = Case[];

describe("rockstar", () => {
  describe("parser", () => {
    describe("increment", () => {
      const cases: Cases = [
        ["Build my world up", 'var("my world")', 1],
        ["Build my world up, up", 'var("my world")', 2],
        ["Build my world up up", 'var("my world")', 2]
      ];
      for (const [input, identifier, times] of cases) {
        it(`${input} => ${times} x inrement(${identifier})`, () => {
          const ast = parse(input as string);

          expect(ast.length).toEqual(times);

          // all are equal
          expect(new Set<string>(ast.map(x => x.toString())).size).toEqual(1);

          const firstNode = ast[0] as IncrementOperation;
          expect(firstNode.type).toEqual(IncrementOperation.type);
          expect(firstNode.target.toString()).toEqual(identifier);
        });
      }
    });

    describe("decrement", () => {
      const cases: Cases = [
        ["Knock the walls down", 'var("the walls")', 1],
        ["Knock the walls down, down", 'var("the walls")', 2],
        ["Knock the walls down down", 'var("the walls")', 2]
      ];
      for (const [input, identifier, times] of cases) {
        it(`${input} => ${times} x decrement(${identifier})`, () => {
          const ast = parse(input as string);

          expect(ast.length).toEqual(times);

          // all are equal
          expect(new Set<string>(ast.map(x => x.toString())).size).toEqual(1);

          const firstNode = ast[0] as DecrementOperation;
          expect(firstNode.type).toEqual(DecrementOperation.type);
          expect(firstNode.target.toString()).toEqual(identifier);
        });
      }
    });
  });
});
