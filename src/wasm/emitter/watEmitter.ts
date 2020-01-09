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
import { WatFormatter } from "./watFormatter";

const formatWatPath = (path: string[]): string => path.map(x => `"${x}"`).join(" ");

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

export const emitWatFunctionCall = (formatter: WatFormatter, node: FunctionCall): string =>
  formatter(`call $${node.name}`, node.args.map(emitExpression));

export const emitWatFunctionDeclaration = (node: FunctionDeclaration): string => {
  // TODO: args and results are always f32
  const watArgs = node.args.map((a, i) => `(param $${i} f32)`).join(" ");
  const watResult = "(result f32)";
  const watFunctionNameAndArgs = `func $${node.name} ${watArgs}`.trim();
  const watBody = node.body.map(emitStatement).join(" ");
  return `${watFunctionNameAndArgs} ${watResult} ${watBody}`.trim();
};

export const emitWatModule = (formatter: WatFormatter, contents: string[]): string =>
  formatter("module", contents);

export const emitWatMemory = (
  formatter: WatFormatter,
  index: number,
  minSize: number,
  maxSize?: number
): string => formatter(`memory $${index} ${minSize} ${maxSize || ""}`.trim());

export type WatExportType = "func" | "memory" | "table" | "global";

export const emitWatExport = (
  formatter: WatFormatter,
  path: string[],
  what: WatExportType,
  name: string
): string => formatter(`export ${formatWatPath(path)} (${what} $${name})`);

export const emitWatMain = (formatter: WatFormatter, main: MainProcedure): string =>
  formatter(`func $${main.name} (result i32)`, [...main.body.map(emitStatement), "(i32.const 0)"]);

export const emitWat = (formatter: WatFormatter, ast: TransformedProgram): string => {
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
  return emitWatModule(formatter, [
    emitWatMemory(formatter, memoryIndex, 1),
    emitWatExport(formatter, ["memory"], "memory", `${memoryIndex}`),
    emitWatExport(formatter, ["main"], "func", main.name),
    emitWatMain(formatter, main)
  ]);
};
