import { TransformedProgram, MainProcedure } from "../transformer";
import {
  NumberLiteral,
  BinaryOperation,
  SimpleExpression,
  Operator,
  FunctionCall,
  FunctionDeclaration,
  Statement
} from "../../rockstar/parser";

const formatWatPath = (path: string[]): string => path.map(x => `"${x}"`).join(" ");

const enclose = (what: string): string => `(${what})`;

export const emitStatement = (node: Statement): string => {
  return "()";
};

export const emitExpression = (node: SimpleExpression): string => {
  switch (node.type) {
    case "number": {
      const numberNode = node as NumberLiteral;
      // TODO: Encode the number properly in case it is float or integer
      return `(f32.const ${numberNode.value})`;
    }
    case "null":
    case "mysterious":
      return "(f32.const 0)";

    default:
      throw new Error(`Unsupported literal: ${node.type}`);
  }
};

const watOperators = new Map<Operator, string>([
  ["add", "f32.add"],
  ["subtract", "f32.sub"],
  ["multiply", "f32.mul"],
  ["divide", "f32.div"]
]);

export const emitWatBinaryExpression = (node: BinaryOperation): string => {
  if (!watOperators.has(node.operator)) throw new Error(`Unsupported operator: ${node.operator}`);

  const left = emitExpression(node.left);
  const right = emitExpression(node.right);
  const op = watOperators.get(node.operator);
  return `(${op} ${left} ${right})`;
};

export const emitWatFunctionCall = (node: FunctionCall): string => {
  const watArgs = node.args.map(a => emitExpression(a));
  const watCall = `call $${node.name} ${watArgs.join(" ")}`.trim();
  return `(${watCall})`;
};

export const emitWatFunctionDeclaration = (node: FunctionDeclaration): string => {
  // TODO: args and results are always f32
  const watArgs = node.args.map((a, i) => `(param $${i} f32)`).join(" ");
  const watResult = "(result f32)";
  const watFunctionNameAndArgs = `func $${node.name} ${watArgs}`.trim();
  const watBody = node.body.map(emitStatement).join(" ");
  return enclose(`${watFunctionNameAndArgs} ${watResult} ${watBody}`.trim());
};

export const emitWatModule = (contents: string[]): string => {
  return `(module ${contents.join(" ")})`;
};

export const emitWatMemory = (index: number, minSize: number, maxSize?: number): string =>
  enclose(`memory $${index} ${minSize} ${maxSize || ""}`.trim());

export type WatExportType = "func" | "memory" | "table" | "global";

export const emitWatExport = (path: string[], what: WatExportType, name: string): string =>
  `(export ${formatWatPath(path)} (${what} $${name}))`;

export const emitWatMain = (main: MainProcedure): string =>
  `(func $${main.name} (result i32) ${main.body.map(emitStatement).join(" ")} (i32.const 0))`;

export const emitWat = (ast: TransformedProgram): string => {
  // TODO: determine imports
  // const declaredFunctionNames = new Set<string>(
  //   ast.filter(x => x.type !== "main").map(x => x.name)
  // );

  // const calledFunctions: { [fnName: string]: FunctionCall } = ast
  //   .reduce<FunctionCall[]>(
  //     (calledFns, fnNode) => [
  //       ...calledFns,
  //       ...(fnNode.body.filter(x => x.type === "call") as FunctionCall[])
  //     ],
  //     []
  //   )
  //   .reduce((calledFns, fn) => Object.assign(calledFns, { [fn.name]: fn }), {});

  // const watImports = Object.keys(calledFunctions)
  //   .filter(fnName => !declaredFunctionNames.has(fnName))
  //   .map(fnName => emitWatImport(["env", fnName], calledFunctions[fnName]));

  const main = ast.find(x => x.type === "main") as MainProcedure;
  if (!main) throw new Error("The provided AST does not contain a `main` procedure");

  const memoryIndex = 0;
  return emitWatModule([
    emitWatMemory(memoryIndex, 1),
    emitWatExport(["memory"], "memory", `${memoryIndex}`),
    emitWatExport(["main"], "func", main.name),
    emitWatMain(main)
  ]);
};
