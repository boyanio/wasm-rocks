import { parse } from "../../../../src/rockstar/parser";
import { IfStatement, BinaryExpression, Block } from "../../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("if statements", () => {
      it("parses if-then statement", () => {
        const program = `
        If Tommy is nobody
        Shout "FizzBuzz!"
        `;
        const { statements } = parse(program);

        expect(statements.length).toEqual(1);
        expect(statements[0].type).toEqual("if");

        const ifStatement = statements[0] as IfStatement;
        expect(ifStatement.condition.type).toEqual("binaryExpression");

        const condition = ifStatement.condition as BinaryExpression;
        expect(condition.operator).toEqual("equals");
        expect(condition.lhs).toEqual({ type: "variable", name: "tommy" });
        expect(condition.rhs).toEqual({ type: "null" });

        expect(ifStatement.then.statements.length).toEqual(1);
        expect(ifStatement.then.statements[0].type).toEqual("say");
      });
    });

    it("parses if-then-else statement", () => {
      const program = `
      If Tommy is nobody
      Shout "FizzBuzz!"

      Else
      Shout 5
      `;
      const { statements } = parse(program);

      expect(statements.length).toEqual(1);
      expect(statements[0].type).toEqual("if");

      const ifStatement = statements[0] as IfStatement;
      expect(ifStatement.condition.type).toEqual("binaryExpression");

      const condition = ifStatement.condition as BinaryExpression;
      expect(condition.operator).toEqual("equals");
      expect(condition.lhs).toEqual({ type: "variable", name: "tommy" });
      expect(condition.rhs).toEqual({ type: "null" });

      expect(ifStatement.then.statements.length).toEqual(1);
      expect(ifStatement.then.statements[0].type).toEqual("say");

      expect(ifStatement.$else).toBeTruthy();
      expect((ifStatement.$else as Block).statements.length).toEqual(1);
      expect((ifStatement.$else as Block).statements[0].type).toEqual("say");
    });
  });
});
