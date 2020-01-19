import { noFormat, emitWat } from "../../../src/wasm/emitter";
import {
  Module,
  Memory,
  Comment,
  CallControlInstruction,
  VariableInstruction,
  VariableInstructionOperation,
  Local,
  ConstInstruction,
  BinaryOperationInstruction,
  BinaryOperation,
  UnaryOperation,
  UnaryOperationInstruction,
  Import,
  Export,
  Function
} from "src/wasm/ast";

type ModuleOptions = {
  memories?: Memory[];
  imports?: Import[];
  exports?: Export[];
  functions?: Function[];
};

const createModule = (options: ModuleOptions): Module =>
  Object.assign<Module, ModuleOptions>(
    {
      exports: [],
      memories: [],
      imports: [],
      functions: []
    },
    options
  );

const emitWithWithNoFormat = (options: ModuleOptions): string =>
  emitWat(noFormat(), createModule(options));

describe("wasm", () => {
  describe("watEmitter", () => {
    describe("memories", () => {
      it("emits memory with min", () => {
        const wat = emitWithWithNoFormat({
          memories: [{ id: "$0", memoryType: { minSize: 1 } }]
        });
        expect(wat).toEqual("(module (memory $0 1))");
      });

      it("emits memory with min and max", () => {
        const wat = emitWithWithNoFormat({
          memories: [{ id: "$0", memoryType: { minSize: 1, maxSize: 2 } }]
        });
        expect(wat).toEqual("(module (memory $0 1 2))");
      });
    });

    describe("imports", () => {
      it("emits memory import", () => {
        const wat = emitWithWithNoFormat({
          imports: [
            {
              module: "env",
              name: "memory",
              importType: { name: "memory", id: "$0", memoryType: { minSize: 1, maxSize: 2 } }
            }
          ]
        });
        expect(wat).toEqual('(module (import "env" "memory" (memory $0 1 2)))');
      });

      it("emits function import", () => {
        const wat = emitWithWithNoFormat({
          imports: [
            {
              module: "env",
              name: "hello",
              importType: {
                name: "func",
                id: "$hello",
                functionType: { params: ["f32", "f32"], result: "f32" }
              }
            }
          ]
        });
        expect(wat).toEqual(
          '(module (import "env" "hello" (func $hello (param f32) (param f32) (result f32))))'
        );
      });
    });

    describe("exports", () => {
      it("emits memory export", () => {
        const wat = emitWithWithNoFormat({
          exports: [{ name: "memory", id: "$0", exportType: "memory" }]
        });
        expect(wat).toEqual('(module (export "memory" (memory $0)))');
      });

      it("emits function export", () => {
        const wat = emitWithWithNoFormat({
          exports: [{ name: "hello", id: "$hello", exportType: "func" }]
        });
        expect(wat).toEqual('(module (export "hello" (func $hello)))');
      });
    });

    describe("functions", () => {
      it("emits comment in a function", () => {
        const comment: Comment = {
          instructionType: "comment",
          value: "hello"
        };
        const wat = emitWithWithNoFormat({
          functions: [
            {
              id: "$hello",
              instructions: [comment],
              locals: [],
              functionType: { params: [], result: null }
            }
          ]
        });
        expect(wat).toEqual("(module (func $hello (; hello ;)))");
      });

      it("emits call to another function", () => {
        const call: CallControlInstruction = {
          instructionType: "call",
          id: "$there"
        };
        const wat = emitWithWithNoFormat({
          functions: [
            {
              id: "$hello",
              instructions: [call],
              locals: [],
              functionType: { params: [], result: null }
            }
          ]
        });
        expect(wat).toEqual("(module (func $hello (call $there)))");
      });

      for (const operation of ["get", "set", "tee"] as VariableInstructionOperation[]) {
        it(`emits variable instruction: ${operation}`, () => {
          const variable: VariableInstruction = {
            instructionType: "variable",
            index: 0,
            operation
          };
          const wat = emitWithWithNoFormat({
            functions: [
              {
                id: "$hello",
                instructions: [variable],
                locals: [],
                functionType: { params: [], result: null }
              }
            ]
          });
          expect(wat).toEqual(`(module (func $hello (local.${operation} 0)))`);
        });
      }

      it("emits const instruction", () => {
        const constInstr: ConstInstruction = {
          instructionType: "const",
          value: 10,
          valueType: "i32"
        };
        const wat = emitWithWithNoFormat({
          functions: [
            {
              id: "$hello",
              instructions: [constInstr],
              locals: [],
              functionType: { params: [], result: null }
            }
          ]
        });
        expect(wat).toEqual("(module (func $hello (i32.const 10)))");
      });

      for (const operation of ["i32.add", "i32.mul", "i32.sub", "i32.div"] as BinaryOperation[]) {
        it(`emits binary operation: ${operation}`, () => {
          const binaryOperation: BinaryOperationInstruction = {
            instructionType: "binaryOperation",
            operation
          };
          const wat = emitWithWithNoFormat({
            functions: [
              {
                id: "$hello",
                instructions: [binaryOperation],
                locals: [],
                functionType: { params: [], result: null }
              }
            ]
          });
          expect(wat).toEqual(`(module (func $hello ${operation}))`);
        });
      }

      for (const operation of ["f32.nearest", "f32.ceil", "f32.floor"] as UnaryOperation[]) {
        it(`emits binary operation: ${operation}`, () => {
          const unaryOperation: UnaryOperationInstruction = {
            instructionType: "unaryOperation",
            operation
          };
          const wat = emitWithWithNoFormat({
            functions: [
              {
                id: "$hello",
                instructions: [unaryOperation],
                locals: [],
                functionType: { params: [], result: null }
              }
            ]
          });
          expect(wat).toEqual(`(module (func $hello ${operation}))`);
        });
      }

      it("emits locals declaration", () => {
        const local0: Local = {
          index: 0,
          localType: "f32"
        };
        const local1: Local = {
          index: 1,
          localType: "i32"
        };
        const wat = emitWithWithNoFormat({
          functions: [
            {
              id: "$hello",
              locals: [local0, local1],
              instructions: [],
              functionType: { params: [], result: null }
            }
          ]
        });
        expect(wat).toEqual("(module (func $hello (local f32) (local i32)))");
      });
    });
  });
});
