import { parse } from "../../../../src/rockstar/parser";
import { SayStatement, ListenStatement } from "src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("say", () => {
      describe("say literal", () => {
        it("Say 5", () => {
          const { statements } = parse("Say 5");

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("say");

          const node = statements[0] as SayStatement;
          expect(node.what).toEqual({ type: "number", value: 5 });
        });

        it('Say "5"', () => {
          const { statements } = parse('Say "5"');

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("say");

          const node = statements[0] as SayStatement;
          expect(node.what).toEqual({ type: "string", value: "5" });
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
            const { statements } = parse(expression);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("say");

            const node = statements[0] as SayStatement;
            expect(node.what).toEqual({ type: "variable", name: variable });
          });
        }
      });

      describe("say pronoun", () => {
        const cases = ["Shout it", "Shout it."];
        for (const expression of cases) {
          it(expression, () => {
            const { statements } = parse(expression);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("say");

            const node = statements[0] as SayStatement;
            expect(node.what).toEqual({ type: "pronoun" });
          });
        }
      });
    });

    describe("listen", () => {
      it("Listen to your heart", () => {
        const { statements } = parse("Listen to your heart");

        expect(statements.length).toEqual(1);
        expect(statements[0].type).toEqual("listen");

        const node = statements[0] as ListenStatement;
        expect(node.to).toEqual({ type: "variable", name: "your heart" });
      });
    });
  });
});
