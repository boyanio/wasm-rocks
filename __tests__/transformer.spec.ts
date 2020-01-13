import { transform } from "../src/transformer";
import { parse } from "../src/rockstar/parser";
import { Program as rockstarProgram } from "../src/rockstar/ast";

describe("transformer", () => {
  it("creates an exported main function with global statements, if none exists", () => {
    const code = `
    X is 5
    Shout it.
    `;
    const rockstarAst = parse(code);
    const wasmAst = transform(rockstarAst);

    expect(wasmAst.functions).toBeTruthy();
    expect(wasmAst.exports).toBeTruthy();

    const mainFnDeclaration = (wasmAst.functions || []).find(f => f.id === "$main");
    expect(mainFnDeclaration).toBeTruthy();

    const mainFnExport = (wasmAst.exports || []).find(
      e => e.exportType === "func" && e.id === "$main" && e.name === "main"
    );
    expect(mainFnExport).toBeTruthy();
  });

  it("throws if there are global statements and a main function", () => {
    const rockstarAst: rockstarProgram = [
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
    const rockstarAst: rockstarProgram = [
      { type: "call", name: "alert", args: [{ type: "number", value: 5 }] }
    ];
    const wasmAst = transform(rockstarAst);

    expect(wasmAst.imports).toBeTruthy();

    const imports = (wasmAst.imports || []).filter(
      im =>
        im.module === "env" &&
        im.name === "alert" &&
        im.importType.name === "func" &&
        im.importType.id === "$alert"
    );
    expect(imports.length).toEqual(1);
  });
});
