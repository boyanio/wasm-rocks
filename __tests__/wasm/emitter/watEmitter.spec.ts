import {
  emitExpression,
  emitWatBinaryExpression,
  emitWatFunctionCall
} from "../../../src/wasm/emitter";
import {
  NumberLiteral,
  BinaryOperation,
  NullLiteral,
  Mysterious,
  FunctionCall
} from "../../../src/rockstar/parser";

describe("wasm", () => {
  describe("watEmitter", () => {
    describe("literals", () => {
      it("emits number literal", () => {
        const wat = emitExpression(new NumberLiteral(5));
        expect(wat).toEqual("(f32.const 5)");
      });

      it("emits null literal as zero", () => {
        const wat = emitExpression(new NullLiteral());
        expect(wat).toEqual("(f32.const 0)");
      });

      it("emits mysterious literal as zero", () => {
        const wat = emitExpression(new Mysterious());
        expect(wat).toEqual("(f32.const 0)");
      });
    });

    describe("binary expressions", () => {
      it("emits addition of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryOperation("add", new NumberLiteral(1), new NumberLiteral(2))
        );
        expect(wat).toEqual("(f32.add (f32.const 1) (f32.const 2))");
      });

      it("emits subtraction of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryOperation("subtract", new NumberLiteral(1), new NumberLiteral(2))
        );
        expect(wat).toEqual("(f32.sub (f32.const 1) (f32.const 2))");
      });

      it("emits multiplication of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryOperation("multiply", new NumberLiteral(1), new NumberLiteral(2))
        );
        expect(wat).toEqual("(f32.mul (f32.const 1) (f32.const 2))");
      });

      it("emits division of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryOperation("divide", new NumberLiteral(1), new NumberLiteral(2))
        );
        expect(wat).toEqual("(f32.div (f32.const 1) (f32.const 2))");
      });
    });

    describe("calls", () => {
      it("emits function call without argument", () => {
        const wat = emitWatFunctionCall(new FunctionCall("say", []));
        expect(wat).toEqual("(call $say)");
      });

      it("emits function call with one argument", () => {
        const wat = emitWatFunctionCall(new FunctionCall("say", [new NumberLiteral(4)]));
        expect(wat).toEqual("(call $say (f32.const 4))");
      });

      it("emits function call with multiple arguments", () => {
        const wat = emitWatFunctionCall(
          new FunctionCall("say", [new NumberLiteral(4), new NumberLiteral(5)])
        );
        expect(wat).toEqual("(call $say (f32.const 4) (f32.const 5))");
      });
    });
  });
});
