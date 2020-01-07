import { parse } from "../../../src/rockstar/parser";

type Cases = string[][];

describe("rockstar", () => {
  describe("parser", () => {
    describe("function calls", () => {
      const cases: Cases = [
        ["Shout Y", 'say(var("y"))'],
        ["Shout it", "say(pronoun())"],
        ["Shout it.", "say(pronoun())"],
        ["Whisper Y", 'say(var("y"))'],
        ["Scream Y", 'say(var("y"))'],
        ["Say Y", 'say(var("y"))']
      ];
      for (const [input, expression] of cases) {
        it(`${input} => ${expression}`, () => {
          const ast = parse(input);

          expect(ast.length).toEqual(1);

          const node = ast[0];
          expect(node.type).toEqual("call");
          expect(node.toString()).toEqual(expression);
        });
      }
    });
  });
});
