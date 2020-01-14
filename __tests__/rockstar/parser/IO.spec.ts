import { parse } from "../../../src/rockstar/parser";
import { SayCall, NamedVariable, NumberLiteral, StringLiteral } from "src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("say", () => {
      describe("say literal", () => {
        it("Say 5", () => {
          const ast = parse("Say 5");

          expect(ast.length).toEqual(1);
          expect(ast[0].type).toEqual("say");

          const node = ast[0] as SayCall;
          expect(node.what.type).toEqual("number");
          expect((node.what as NumberLiteral).value).toEqual(5);
        });

        it('Say "5"', () => {
          const ast = parse('Say "5"');

          expect(ast.length).toEqual(1);
          expect(ast[0].type).toEqual("say");

          const node = ast[0] as SayCall;
          expect(node.what.type).toEqual("string");
          expect((node.what as StringLiteral).value).toEqual("5");
        });
      });

      describe("say variable", () => {
        type Cases = [string, string][];
        const cases: Cases = [
          ["Shout Y", "y"],
          ["Whisper Y", "y"],
          ["Scream Y", "y"],
          ["Say Y", "y"]
        ];
        for (const [expression, variable] of cases) {
          it(expression, () => {
            const ast = parse(expression);

            expect(ast.length).toEqual(1);
            expect(ast[0].type).toEqual("say");

            const node = ast[0] as SayCall;
            expect(node.what.type).toEqual("variable");
            expect((node.what as NamedVariable).name).toEqual(variable);
          });
        }
      });

      describe("say pronoun", () => {
        const cases = ["Shout it", "Shout it."];
        for (const expression of cases) {
          it(expression, () => {
            const ast = parse(expression);

            expect(ast.length).toEqual(1);
            expect(ast[0].type).toEqual("say");

            const node = ast[0] as SayCall;
            expect(node.what.type).toEqual("pronoun");
          });
        }
      });
    });
  });
});
