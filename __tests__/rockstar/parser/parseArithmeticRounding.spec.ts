import {
  parse,
  RoundOperation,
  RoundUpOperation,
  RoundDownOperation
} from "../../../src/rockstar/parser";

type Case = [string, string];
type Cases = Case[];

describe("rockstar", () => {
  describe("parser", () => {
    describe("arithmetic rounding", () => {
      describe("round", () => {
        const cases: Cases = [
          ["Turn round X", 'var("x")'],
          ["Turn around X", 'var("x")'],
          ["Turn her around.", "pronoun()"],
          ["Turn them round.", "pronoun()"]
        ];
        for (const [input, identifier] of cases) {
          it(`${input} => round(${identifier})`, () => {
            const ast = parse(input as string);

            expect(ast.length).toEqual(1);

            const firstNode = ast[0] as RoundOperation;
            expect(firstNode.type).toEqual(RoundOperation.type);
            expect(firstNode.target.toString()).toEqual(identifier);
          });
        }
      });

      describe("round up", () => {
        const cases: Cases = [
          ["Turn up X", 'var("x")'],
          ["Turn it up", "pronoun()"],
          ["Turn it up.", "pronoun()"]
        ];
        for (const [input, identifier] of cases) {
          it(`${input} => roundUp(${identifier})`, () => {
            const ast = parse(input as string);

            expect(ast.length).toEqual(1);

            const firstNode = ast[0] as RoundUpOperation;
            expect(firstNode.type).toEqual(RoundUpOperation.type);
            expect(firstNode.target.toString()).toEqual(identifier);
          });
        }
      });

      describe("round down", () => {
        const cases: Cases = [
          ["Turn down X", 'var("x")'],
          ["Turn them down", "pronoun()"],
          ["Turn them down.", "pronoun()"]
        ];
        for (const [input, identifier] of cases) {
          it(`${input} => roundDown(${identifier})`, () => {
            const ast = parse(input as string);

            expect(ast.length).toEqual(1);

            const firstNode = ast[0] as RoundDownOperation;
            expect(firstNode.type).toEqual(RoundDownOperation.type);
            expect(firstNode.target.toString()).toEqual(identifier);
          });
        }
      });
    });
  });
});
