import { parse } from "../../../src/rockstar/parser";

type Cases = string[][];

describe("rockstar", () => {
  describe("parse", () => {
    describe("calls", () => {
      const cases: Cases = [
        ["Shout X", 'say(var("x"))'],
        ["Shout it.", "say(var())"]
      ];
      for (const [input, expression] of cases) {
        it(`${input} => ${expression}`, () => {
          const ast = parse(input as string);

          expect(ast.length).toBeTruthy();

          const node = ast[ast.length - 1];
          expect(node.type).toEqual("call");
          expect(node.toString()).toEqual(expression);
        });
      }
    });
  });
});
