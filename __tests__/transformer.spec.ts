import { transform } from "../src/transformer";
import * as rockstar from "../src/rockstar/ast";
import * as wasm from "src/wasm/ast";

describe("transformer", () => {
  it("creates an exported main function with global statements, if none exists", () => {
    const wasmAst = transform([
      {
        type: "variableDeclaration",
        variable: { type: "variable", name: "x" },
        value: { type: "number", value: 5 }
      },
      {
        type: "call",
        name: "say",
        args: [{ type: "pronoun" }]
      }
    ]);

    const mainFnDeclaration = wasmAst.functions.find(f => f.id === "$main");
    expect(mainFnDeclaration).toBeTruthy();

    const mainFnExport = wasmAst.exports.find(
      e => e.exportType === "func" && e.id === "$main" && e.name === "main"
    );
    expect(mainFnExport).toBeTruthy();
  });

  it("throws if there are global statements and a main function", () => {
    const rockstarAst: rockstar.Program = [
      {
        type: "simpleAssignment",
        target: { type: "variable", name: "x" },
        expression: { type: "number", value: 5 }
      },
      {
        type: "function",
        name: "main",
        args: [],
        result: { type: "pronoun" },
        statements: [
          {
            type: "simpleAssignment",
            target: { type: "variable", name: "y" },
            expression: { type: "number", value: 5 }
          }
        ]
      }
    ];
    expect(() => transform(rockstarAst)).toThrow();
  });

  it("adds an import when calling a non-defined function", () => {
    const rockstarAst: rockstar.Program = [
      { type: "call", name: "alert", args: [{ type: "number", value: 5 }] }
    ];
    const wasmAst = transform(rockstarAst);

    const imports = wasmAst.imports.filter(
      im =>
        im.module === "env" &&
        im.name === "alert" &&
        im.importType.name === "func" &&
        im.importType.id === "$alert"
    );
    expect(imports.length).toEqual(1);
  });

  describe("simple assignments", () => {
    it("transforms simple assignment to a number", () => {
      const wasmAst = transform([
        {
          type: "variableDeclaration",
          variable: { type: "variable", name: "x" },
          value: { type: "number", value: 5 }
        },
        {
          type: "simpleAssignment",
          target: { type: "variable", name: "x" },
          expression: { type: "number", value: 10 }
        }
      ]);

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5, valueType: "f32" },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "const", value: 10, valueType: "f32" },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });

    type Case = [rockstar.ArithmeticOperator, wasm.BinaryOperation];
    for (const [arithmeticOperator, binaryOperation] of [
      ["add", "f32.add"],
      ["divide", "f32.div"],
      ["multiply", "f32.mul"],
      ["subtract", "f32.sub"]
    ] as Case[]) {
      it(`transforms simple assignment to an arithmetic expression: ${arithmeticOperator}`, () => {
        const wasmAst = transform([
          {
            type: "variableDeclaration",
            variable: { type: "variable", name: "x" },
            value: { type: "number", value: 5 }
          },
          {
            type: "variableDeclaration",
            variable: { type: "variable", name: "y" },
            value: { type: "number", value: 6 }
          },
          {
            type: "simpleAssignment",
            target: { type: "variable", name: "x" },
            expression: {
              type: "arithmeticExpression",
              left: { type: "variable", name: "y" },
              right: { type: "number", value: 10 },
              operator: arithmeticOperator
            }
          }
        ]);

        const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
        expect(mainFn).toBeTruthy();
        expect(mainFn.locals.length).toEqual(2);
        expect(mainFn.instructions).toEqual([
          { instructionType: "const", value: 5, valueType: "f32" },
          { instructionType: "variable", index: 0, operation: "set" },
          { instructionType: "const", value: 6, valueType: "f32" },
          { instructionType: "variable", index: 1, operation: "set" },
          { instructionType: "variable", index: 1, operation: "get" },
          { instructionType: "const", value: 10, valueType: "f32" },
          { instructionType: "binaryOperation", operation: binaryOperation },
          { instructionType: "variable", index: 0, operation: "set" },
          { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
        ]);
      });
    }
  });

  type CompoundAssignmentCase = [rockstar.ArithmeticOperator, wasm.BinaryOperation];
  for (const [arithmeticOperator, binaryOperation] of [
    ["add", "f32.add"],
    ["divide", "f32.div"],
    ["multiply", "f32.mul"],
    ["subtract", "f32.sub"]
  ] as CompoundAssignmentCase[]) {
    it(`transforms compound assignment: ${arithmeticOperator}`, () => {
      const wasmAst = transform([
        {
          type: "variableDeclaration",
          variable: { type: "variable", name: "x" },
          value: { type: "number", value: 5 }
        },
        {
          type: "compoundAssignment",
          operator: arithmeticOperator,
          target: { type: "variable", name: "x" },
          right: { type: "number", value: 5 }
        }
      ]);

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5, valueType: "f32" },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "variable", index: 0, operation: "get" },
        { instructionType: "const", value: 5, valueType: "f32" },
        { instructionType: "binaryOperation", operation: binaryOperation },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });
  }

  type IncrementDecrementCase = ["increment" | "decrement", wasm.BinaryOperation];
  for (const [incOrDec, binaryOperation] of [
    ["increment", "f32.add"],
    ["decrement", "f32.sub"]
  ] as IncrementDecrementCase[]) {
    it(`transforms ${incOrDec}`, () => {
      const wasmAst = transform([
        {
          type: "variableDeclaration",
          variable: { type: "variable", name: "x" },
          value: { type: "number", value: 5 }
        },
        {
          type: incOrDec,
          target: { type: "variable", name: "x" }
        }
      ]);

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5, valueType: "f32" },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "variable", index: 0, operation: "get" },
        { instructionType: "const", value: 1, valueType: "f32" },
        { instructionType: "binaryOperation", operation: binaryOperation },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });
  }

  type RockstarRoundingCase = [rockstar.ArithmeticRoundingDirection, wasm.UnaryOperation];
  for (const [roundingDirection, unaryOperation] of [
    ["upOrDown", "f32.nearest"],
    ["up", "f32.ceil"],
    ["down", "f32.floor"]
  ] as RockstarRoundingCase[]) {
    it(`transforms arithmetic rounding ${roundingDirection}`, () => {
      const wasmAst = transform([
        {
          type: "variableDeclaration",
          variable: { type: "variable", name: "x" },
          value: { type: "number", value: 5.4 }
        },
        {
          type: "round",
          target: { type: "variable", name: "x" },
          direction: roundingDirection
        }
      ]);

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5.4, valueType: "f32" },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "variable", index: 0, operation: "get" },
        { instructionType: "unaryOperation", operation: unaryOperation },
        { instructionType: "variable", index: 0, operation: "set" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });

    it("transforms comments", () => {
      const wasmAst = transform([
        {
          type: "comment",
          comment: "hello"
        }
      ]);

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.instructions).toEqual([
        { instructionType: "comment", value: "hello" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });
  }

  it("transforms function with one argument and result", () => {
    const wasmAst = transform([
      {
        type: "function",
        name: "hello",
        args: [{ type: "variable", name: "x" }],
        result: { type: "variable", name: "x" },
        statements: []
      }
    ]);

    const fn = wasmAst.functions.find(f => f.id === "$hello") as wasm.Function;
    expect(fn).toBeTruthy();
    expect(fn.functionType.params.length).toEqual(1);
    expect(fn.functionType.result).toEqual("f32");
    expect(fn.locals.length).toEqual(1);
    expect(fn.instructions.length).toEqual(0);
  });
});
