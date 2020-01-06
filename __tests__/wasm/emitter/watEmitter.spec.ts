import {
  emitExpression,
  emitWatBinaryExpression,
  emitWatFunctionCall
} from "../../../src/wasm/emitter";
import {
  NumberLiteralNode,
  BinaryExpressionNode,
  NullLiteralNode,
  MysteriousLiteralNode,
  FunctionCallNode
} from "../../../src/rockstar/parser";

describe("wasm", () => {
  describe("watEmitter", () => {
    describe("literals", () => {
      it("emits number literal", () => {
        const wat = emitExpression(new NumberLiteralNode(5));
        expect(wat).toEqual("(f32.const 5)");
      });

      it("emits null literal as zero", () => {
        const wat = emitExpression(new NullLiteralNode());
        expect(wat).toEqual("(f32.const 0)");
      });

      it("emits mysterious literal as zero", () => {
        const wat = emitExpression(new MysteriousLiteralNode());
        expect(wat).toEqual("(f32.const 0)");
      });
    });

    describe("binary expressions", () => {
      it("emits addition of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryExpressionNode("add", new NumberLiteralNode(1), new NumberLiteralNode(2))
        );
        expect(wat).toEqual("(f32.add (f32.const 1) (f32.const 2))");
      });

      it("emits subtraction of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryExpressionNode("subtract", new NumberLiteralNode(1), new NumberLiteralNode(2))
        );
        expect(wat).toEqual("(f32.sub (f32.const 1) (f32.const 2))");
      });

      it("emits multiplication of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryExpressionNode("multiply", new NumberLiteralNode(1), new NumberLiteralNode(2))
        );
        expect(wat).toEqual("(f32.mul (f32.const 1) (f32.const 2))");
      });

      it("emits division of two numbers", () => {
        const wat = emitWatBinaryExpression(
          new BinaryExpressionNode("divide", new NumberLiteralNode(1), new NumberLiteralNode(2))
        );
        expect(wat).toEqual("(f32.div (f32.const 1) (f32.const 2))");
      });
    });

    describe("calls", () => {
      it("emits function call without argument", () => {
        const wat = emitWatFunctionCall(new FunctionCallNode("say", []));
        expect(wat).toEqual("(call $say)");
      });

      it("emits function call with one argument", () => {
        const wat = emitWatFunctionCall(new FunctionCallNode("say", [new NumberLiteralNode(4)]));
        expect(wat).toEqual("(call $say (f32.const 4))");
      });

      it("emits function call with multiple arguments", () => {
        const wat = emitWatFunctionCall(
          new FunctionCallNode("say", [new NumberLiteralNode(4), new NumberLiteralNode(5)])
        );
        expect(wat).toEqual("(call $say (f32.const 4) (f32.const 5))");
      });
    });
  });
});
