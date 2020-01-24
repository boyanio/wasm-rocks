import { parse } from "../../../../src/rockstar/parser";
import { BinaryExpression, Loop } from "../../../../src/rockstar/ast";

describe("rockstar", () => {
  describe("parser", () => {
    describe("loops", () => {
      for (const loopType of ["While", "Until"]) {
        it(`parses ${loopType} loop`, () => {
          const program = `
          ${loopType} Tommy ain't nothing,
          Knock Tommy down
          `;
          const { statements } = parse(program);

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("loop");

          const loop = statements[0] as Loop;
          expect(loop.condition.type).toEqual("binaryExpression");

          const condition = loop.condition as BinaryExpression;
          expect(condition.operator).toEqual("notEquals");
          expect(condition.lhs).toEqual({ type: "variable", name: "tommy" });
          expect(condition.rhs).toEqual({ type: "null" });

          expect(loop.body.statements.length).toEqual(1);
          expect(loop.body.statements[0].type).toEqual("decrement");
        });
      }

      for (const br of ["Break", "Break it down"]) {
        it(`parses loop with: ${br}`, () => {
          const program = `
          While Tommy ain't nothing,
          ${br}
          `;
          const { statements } = parse(program);

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("loop");

          const loop = statements[0] as Loop;
          expect(loop.body.statements[0].type).toEqual("break");
        });
      }

      for (const cont of ["Continue", "Take it to the top"]) {
        it(`parses loop with: ${cont}`, () => {
          const program = `
          While Tommy ain't nothing,
          ${cont}
          `;
          const { statements } = parse(program);

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("loop");

          const loop = statements[0] as Loop;
          expect(loop.body.statements[0].type).toEqual("continue");
        });
      }
    });
  });
});
