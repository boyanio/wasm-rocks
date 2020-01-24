import { transform } from "../src/transformer";
import * as rockstar from "../src/rockstar/ast";
import * as wasm from "src/wasm/ast";

describe("transformer", () => {
  it("creates an exported main function with global statements", () => {
    const wasmAst = transform({
      type: "program",
      statements: [
        {
          type: "variableDeclaration",
          variable: { type: "variable", name: "x" },
          value: { type: "number", value: 5 }
        }
      ]
    });

    const mainFnDeclaration = wasmAst.functions.find(f => f.id === "$main");
    expect(mainFnDeclaration).toBeTruthy();

    const mainFnExport = wasmAst.exports.find(
      e => e.exportType === "func" && e.id === "$main" && e.name === "main"
    );
    expect(mainFnExport).toBeTruthy();
  });

  it("throws if there are global statements and a main function", () => {
    const rockstarAst: rockstar.Program = {
      type: "program",
      statements: [
        {
          type: "assignment",
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
              type: "assignment",
              target: { type: "variable", name: "y" },
              expression: { type: "number", value: 5 }
            }
          ]
        }
      ]
    };
    expect(() => transform(rockstarAst)).toThrow();
  });

  it("adds an import for I/O: say", () => {
    const rockstarAst: rockstar.Program = {
      type: "program",
      statements: [{ type: "say", what: { type: "number", value: 5 } }]
    };
    const wasmAst = transform(rockstarAst);

    const imports = wasmAst.imports.filter(
      im =>
        im.module === "env" &&
        im.name === "print" &&
        im.importType.name === "func" &&
        im.importType.id === "$print"
    );
    expect(imports.length).toEqual(1);

    const funcImportType = imports[0].importType as wasm.FunctionImportType;
    expect(funcImportType.functionType.params).toEqual([{ valueType: "i32", id: "$what" }]);
    expect(funcImportType.functionType.resultType).toBeUndefined();
  });

  it("adds an import for I/O: listen", () => {
    const rockstarAst: rockstar.Program = {
      type: "program",
      statements: [{ type: "listen", to: { type: "variable", name: "x" } }]
    };
    const wasmAst = transform(rockstarAst);

    const imports = wasmAst.imports.filter(
      im =>
        im.module === "env" &&
        im.name === "prompt" &&
        im.importType.name === "func" &&
        im.importType.id === "$prompt"
    );
    expect(imports.length).toEqual(1);

    const funcImportType = imports[0].importType as wasm.FunctionImportType;
    expect(funcImportType.functionType.params.length).toEqual(0);
    expect(funcImportType.functionType.resultType).toEqual("i32");
  });

  describe("assignments", () => {
    it("transforms assignment to a number", () => {
      const wasmAst = transform({
        type: "program",
        statements: [
          {
            type: "variableDeclaration",
            variable: { type: "variable", name: "x" },
            value: { type: "number", value: 5 }
          },
          {
            type: "assignment",
            target: { type: "variable", name: "x" },
            expression: { type: "number", value: 10 }
          }
        ]
      });

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5, valueType: "i32" },
        { instructionType: "variable", id: "$x", operation: "set" },
        { instructionType: "const", value: 10, valueType: "i32" },
        { instructionType: "variable", id: "$x", operation: "set" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });

    type Case = [rockstar.ArithmeticOperator, wasm.BinaryOperation];
    for (const [arithmeticOperator, binaryOperation] of [
      ["add", "i32.add"],
      ["divide", "i32.div"],
      ["multiply", "i32.mul"],
      ["subtract", "i32.sub"]
    ] as Case[]) {
      it(`transforms assignment to an arithmetic expression: ${arithmeticOperator}`, () => {
        const wasmAst = transform({
          type: "program",
          statements: [
            {
              type: "variableDeclaration",
              variable: { type: "variable", name: "my desire" },
              value: { type: "number", value: 5 }
            },
            {
              type: "variableDeclaration",
              variable: { type: "variable", name: "y" },
              value: { type: "number", value: 6 }
            },
            {
              type: "assignment",
              target: { type: "variable", name: "my desire" },
              expression: {
                type: "binaryExpression",
                lhs: { type: "variable", name: "y" },
                rhs: { type: "number", value: 10 },
                operator: arithmeticOperator
              }
            }
          ]
        });

        const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
        expect(mainFn).toBeTruthy();
        expect(mainFn.locals.length).toEqual(2);
        expect(mainFn.instructions).toEqual([
          { instructionType: "const", value: 5, valueType: "i32" },
          { instructionType: "variable", id: "$mydesire", operation: "set" },
          { instructionType: "const", value: 6, valueType: "i32" },
          { instructionType: "variable", id: "$y", operation: "set" },
          {
            instructionType: "block",
            resultType: "i32",
            instructions: [
              { instructionType: "variable", id: "$y", operation: "get" },
              { instructionType: "const", value: 10, valueType: "i32" },
              { instructionType: "binaryOperation", operation: binaryOperation }
            ]
          },
          { instructionType: "variable", id: "$mydesire", operation: "set" },
          { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
        ]);
      });
    }
  });

  type CompoundAssignmentCase = [rockstar.ArithmeticOperator, wasm.BinaryOperation];
  for (const [arithmeticOperator, binaryOperation] of [
    ["add", "i32.add"],
    ["divide", "i32.div"],
    ["multiply", "i32.mul"],
    ["subtract", "i32.sub"]
  ] as CompoundAssignmentCase[]) {
    it(`transforms compound assignment: ${arithmeticOperator}`, () => {
      const wasmAst = transform({
        type: "program",
        statements: [
          {
            type: "variableDeclaration",
            variable: { type: "variable", name: "x" },
            value: { type: "number", value: 5 }
          },
          {
            type: "assignment",
            target: { type: "variable", name: "x" },
            expression: {
              type: "binaryExpression",
              lhs: { type: "variable", name: "x" },
              rhs: { type: "number", value: 5 },
              operator: arithmeticOperator
            }
          }
        ]
      });

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5, valueType: "i32" },
        { instructionType: "variable", id: "$x", operation: "set" },
        {
          instructionType: "block",
          resultType: "i32",
          instructions: [
            { instructionType: "variable", id: "$x", operation: "get" },
            { instructionType: "const", value: 5, valueType: "i32" },
            { instructionType: "binaryOperation", operation: binaryOperation }
          ]
        },
        { instructionType: "variable", id: "$x", operation: "set" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });
  }

  type IncrementDecrementCase = ["increment" | "decrement", wasm.BinaryOperation];
  for (const [incOrDec, binaryOperation] of [
    ["increment", "i32.add"],
    ["decrement", "i32.sub"]
  ] as IncrementDecrementCase[]) {
    it(`transforms ${incOrDec}`, () => {
      const wasmAst = transform({
        type: "program",
        statements: [
          {
            type: "variableDeclaration",
            variable: { type: "variable", name: "x" },
            value: { type: "number", value: 5 }
          },
          {
            type: incOrDec,
            target: { type: "variable", name: "x" },
            times: 1
          }
        ]
      });

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5, valueType: "i32" },
        { instructionType: "variable", id: "$x", operation: "set" },
        { instructionType: "variable", id: "$x", operation: "get" },
        { instructionType: "const", value: 1, valueType: "i32" },
        { instructionType: "binaryOperation", operation: binaryOperation },
        { instructionType: "variable", id: "$x", operation: "set" },
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
      const wasmAst = transform({
        type: "program",
        statements: [
          {
            type: "variableDeclaration",
            variable: { type: "variable", name: "x" },
            value: { type: "number", value: 5 }
          },
          {
            type: "round",
            target: { type: "variable", name: "x" },
            direction: roundingDirection
          }
        ]
      });

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.locals.length).toEqual(1);
      expect(mainFn.instructions).toEqual([
        { instructionType: "const", value: 5, valueType: "i32" },
        { instructionType: "variable", id: "$x", operation: "set" },
        { instructionType: "variable", id: "$x", operation: "get" },
        { instructionType: "unaryOperation", operation: "f32.convert_i32_s" },
        { instructionType: "unaryOperation", operation: unaryOperation },
        { instructionType: "unaryOperation", operation: "i32.trunc_f32_s" },
        { instructionType: "variable", id: "$x", operation: "set" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });

    it("transforms comments", () => {
      const wasmAst = transform({
        type: "program",
        statements: [
          {
            type: "comment",
            comment: "hello"
          }
        ]
      });

      const mainFn = wasmAst.functions.find(f => f.id === "$main") as wasm.Function;
      expect(mainFn).toBeTruthy();
      expect(mainFn.instructions).toEqual([
        { instructionType: "comment", value: "hello" },
        { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
      ]);
    });
  }

  it("transforms function with one argument and result", () => {
    const wasmAst = transform({
      type: "program",
      statements: [
        {
          type: "function",
          name: "hello",
          args: [{ type: "variable", name: "x" }],
          result: { type: "variable", name: "x" },
          statements: []
        }
      ]
    });

    const fn = wasmAst.functions.find(f => f.id === "$hello") as wasm.Function;
    expect(fn).toBeTruthy();
    expect(fn.functionType.params.length).toEqual(1);
    expect(fn.functionType.resultType).toEqual("i32");
  });

  it("does not transform function params as locals", () => {
    const wasmAst = transform({
      type: "program",
      statements: [
        {
          type: "function",
          name: "hello",
          args: [{ type: "variable", name: "x" }],
          result: { type: "variable", name: "x" },
          statements: []
        }
      ]
    });

    const fn = wasmAst.functions.find(f => f.id === "$hello") as wasm.Function;
    expect(fn.locals.length).toEqual(0);
  });

  it("transforms variacle declaration as a function local", () => {
    const wasmAst = transform({
      type: "program",
      statements: [
        {
          type: "function",
          name: "hello",
          args: [{ type: "variable", name: "x" }],
          result: { type: "variable", name: "x" },
          statements: [
            {
              type: "variableDeclaration",
              variable: { type: "variable", name: "y" },
              value: { type: "number", value: 5 }
            }
          ]
        }
      ]
    });

    const fn = wasmAst.functions.find(f => f.id === "$hello") as wasm.Function;
    expect(fn.locals.length).toEqual(1);
  });

  it("creates single memory with min size 1 and no max size", () => {
    const wasmAst = transform({
      type: "program",
      statements: [
        {
          type: "variableDeclaration",
          variable: { type: "variable", name: "x" },
          value: { type: "number", value: 5 }
        }
      ]
    });

    expect(wasmAst.memories.length).toEqual(1);

    const memory = wasmAst.memories[0];
    expect(memory.id).toEqual("$memory");
    expect(memory.memoryType.minSize).toEqual(1);
    expect(memory.memoryType.maxSize).toBeFalsy();
  });

  it("exports the single memory", () => {
    const wasmAst = transform({
      type: "program",
      statements: [
        {
          type: "variableDeclaration",
          variable: { type: "variable", name: "x" },
          value: { type: "number", value: 5 }
        }
      ]
    });

    const $export = wasmAst.exports.find(x => x.id === "$memory") as wasm.Export;
    expect($export).toBeTruthy();
    expect($export.name).toEqual("memory");
    expect($export.exportType).toEqual("memory");
  });
});
