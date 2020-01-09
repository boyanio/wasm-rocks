import {
  emitExpression,
  emitWatBinaryExpression,
  emitWatFunctionCall,
  emitWatMemory,
  emitWatExport,
  emitWatModule,
  emitWatFunctionDeclaration
} from "../../../src/wasm/emitter/watEmitter";
import {
  NumberLiteral,
  BinaryOperation,
  NullLiteral,
  Mysterious,
  FunctionCall,
  FunctionDeclaration,
  Variable
} from "../../../src/rockstar/parser";
import { noFormat } from "../../../src/wasm/emitter";

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
        const wat = emitWatFunctionCall(noFormat(), new FunctionCall("say", []));
        expect(wat).toEqual("(call $say)");
      });

      it("emits function call with one argument", () => {
        const wat = emitWatFunctionCall(
          noFormat(),
          new FunctionCall("say", [new NumberLiteral(4)])
        );
        expect(wat).toEqual("(call $say (f32.const 4))");
      });

      it("emits function call with multiple arguments", () => {
        const wat = emitWatFunctionCall(
          noFormat(),
          new FunctionCall("say", [new NumberLiteral(4), new NumberLiteral(5)])
        );
        expect(wat).toEqual("(call $say (f32.const 4) (f32.const 5))");
      });
    });

    describe("memory", () => {
      it("emits memory with min size", () => {
        const wat = emitWatMemory(noFormat(), 1, 5);
        expect(wat).toEqual("(memory $1 5)");
      });

      it("emits memory with min and max size", () => {
        const wat = emitWatMemory(noFormat(), 1, 5, 10);
        expect(wat).toEqual("(memory $1 5 10)");
      });
    });

    describe("exports", () => {
      it("emits memory export", () => {
        const wat = emitWatExport(noFormat(), ["a", "b"], "memory", "0");
        expect(wat).toEqual('(export "a" "b" (memory $0))');
      });

      it("emits function export", () => {
        const wat = emitWatExport(noFormat(), ["what"], "func", "fnname");
        expect(wat).toEqual('(export "what" (func $fnname))');
      });
    });

    describe("module", () => {
      it("emits module", () => {
        const wat = emitWatModule(noFormat(), ["test"]);
        expect(wat).toEqual("(module test)");
      });
    });

    describe("functions", () => {
      it("emits always function with float result", () => {
        const wat = emitWatFunctionDeclaration(
          noFormat(),
          new FunctionDeclaration("test", [], new Variable("var"), [])
        );
        expect(wat).toEqual("(func $test (result f32))");
      });

      it("emits arguments with increasing index", () => {
        const wat = emitWatFunctionDeclaration(
          noFormat(),
          new FunctionDeclaration(
            "test",
            [new Variable("a"), new Variable("b")],
            new Variable("var"),
            []
          )
        );
        expect(wat).toEqual("(func $test (param $0 f32) (param $1 f32) (result f32))");
      });
    });
  });
});
