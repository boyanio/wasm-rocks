import { parse } from "../../../src/rockstar/parser";
import { FunctionDeclaration } from "../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("function declarations", () => {
      it("parses function with one argument", () => {
        const { statements } = parse(`
        Hello takes X

        Give back X
        `);

        expect(statements.length).toEqual(1);
        expect(statements[0].type).toEqual("function");

        const node = statements[0] as FunctionDeclaration;
        expect(node.name).toEqual("hello");
        expect(node.args.length).toEqual(1);
        expect(node.args[0].name).toEqual("x");
        expect(node.result.type).toEqual("variable");
        expect(node.statements.length).toEqual(0);
      });

      it("parses function with two arguments", () => {
        const { statements } = parse(`
        Hello takes X and Y

        Give back X
        `);

        expect(statements.length).toEqual(1);
        expect(statements[0].type).toEqual("function");

        const node = statements[0] as FunctionDeclaration;
        expect(node.name).toEqual("hello");
        expect(node.args.length).toEqual(2);
        expect(node.args[0].name).toEqual("x");
        expect(node.args[1].name).toEqual("y");
        expect(node.result.type).toEqual("variable");
        expect(node.statements.length).toEqual(0);
      });

      it("parses function with one statement", () => {
        const { statements } = parse(`
        Hello takes X
        Shout X

        Give back X
        `);

        expect(statements.length).toEqual(1);
        expect(statements[0].type).toEqual("function");

        const node = statements[0] as FunctionDeclaration;
        expect(node.statements.length).toEqual(1);
        expect(node.statements[0].type).toEqual("say");
      });
    });
  });
});
