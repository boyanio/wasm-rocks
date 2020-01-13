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

  it("transforms compound assignment", () => {
    const wasmAst = transform([
      {
        type: "variableDeclaration",
        variable: { type: "variable", name: "x" },
        value: { type: "number", value: 5 }
      },
      {
        type: "compoundAssignment",
        operator: "subtract",
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
      { instructionType: "binaryOperation", operation: "f32.sub" },
      { instructionType: "variable", index: 0, operation: "set" },
      { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
    ]);
  });

  it("transforms increment", () => {
    const wasmAst = transform([
      {
        type: "variableDeclaration",
        variable: { type: "variable", name: "x" },
        value: { type: "number", value: 5 }
      },
      {
        type: "increment",
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
      { instructionType: "binaryOperation", operation: "f32.add" },
      { instructionType: "variable", index: 0, operation: "set" },
      { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
    ]);
  });

  it("transforms decrement", () => {
    const wasmAst = transform([
      {
        type: "variableDeclaration",
        variable: { type: "variable", name: "x" },
        value: { type: "number", value: 5 }
      },
      {
        type: "decrement",
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
      { instructionType: "binaryOperation", operation: "f32.sub" },
      { instructionType: "variable", index: 0, operation: "set" },
      { instructionType: "const", value: 0, valueType: "i32" } // main fn ends with this
    ]);
  });

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
  }
});
