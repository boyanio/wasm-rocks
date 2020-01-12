import { transform } from "../src/transformer";
import * as rockstar from "../src/rockstar/parser";

describe("transformer", () => {
  it("creates an exported main function with global statements, if none exists", () => {
    const code = `
    X is 5
    Shout it.
    `;
    const rockstarAst = rockstar.parse(code);
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
    const rockstarAst: rockstar.Program = [
      new rockstar.Assignment(new rockstar.Variable("x"), new rockstar.NumberLiteral(5)),
      new rockstar.FunctionDeclaration("main", [], new rockstar.Pronoun(), [
        new rockstar.Assignment(new rockstar.Variable("y"), new rockstar.NumberLiteral(5))
      ])
    ];
    expect(() => transform(rockstarAst)).toThrow();
  });

  it("adds an import when calling a non-defined function", () => {
    const rockstarAst: rockstar.Program = [
      new rockstar.FunctionCall("alert", [new rockstar.NumberLiteral(5)])
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
