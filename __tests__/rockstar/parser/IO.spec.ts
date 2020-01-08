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
        ["Say Y", 'say(var("y"))'],
        ["Say 5", "say(5)"],
        ['Say "5"', 'say("5")']
      ];
      for (const [input, expression] of cases) {
        it(`${input} => ${expression}`, () => {
          const ast = parse(input);

          expect(ast.length).toEqual(1);

          const node = ast[0];
          expect(node.type).toEqual("say");
          expect(node.toString()).toEqual(expression);
        });
      }
    });
  });
});
