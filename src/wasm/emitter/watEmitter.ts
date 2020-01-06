import { TransformedProgram } from "../../rockstar/transformer";
import {
  NumberLiteralNode,
  BinaryExpressionNode,
  ExpressionNode,
  Operator,
  FunctionCallNode,
  FunctionDeclarationNode,
  StatementNode
} from "../../rockstar/parser";

export const emitStatement = (node: StatementNode): string = {

};

export const emitExpression = (node: ExpressionNode): string => {
  switch (node.type) {
    case "number": {
      const numberNode = node as NumberLiteralNode;
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

export const emitWatBinaryExpression = (node: BinaryExpressionNode): string => {
  if (!watOperators.has(node.operator)) throw new Error(`Unsupported operator: ${node.operator}`);

  const left = emitExpression(node.left);
  const right = emitExpression(node.right);
  const op = watOperators.get(node.operator);
  return `(${op} ${left} ${right})`;
};

export const emitWatFunctionCall = (node: FunctionCallNode): string => {
  const watArgs = node.args.map(a => emitExpression(a));
  const watCall = `call $${node.name} ${watArgs.join(" ")}`.trim();
  return `(${watCall})`;
};

export const emitWatFunctionDeclaration = (node: FunctionDeclarationNode): string => {
  const params = node.args.map((a, i) => `(param $${i} f32)`).join(" ");
  const result = node.result ? `(result f32)` : null;
  const watFunctionParamsAndResult = `func $${node.name} ${params} ${result}`.trim();
  const body = node.body.map(x => emitStatement(x)).join(" ");
  return `(${watFunctionParamsAndResult} ${body})`;
};

export const emitWatModule = (contents: string[]): string => {
  return `(module ${contents.join(" ")})`;
};

export const emitWatImport = (path: string[], node: FunctionCallNode): string => {
  const formattedPath = path.map(x => `"${x}"`).join(" ");
  const fnArgs = node.args.map((a, i))
  const fn = `(func $${node.name})`;
  return `(import ${formattedPath} ${emitWatFunctionDeclaration(node)})`;
};

export const emitWatMemory = (): string => "(memory $0 1)";

export const emitWatExportMemory = (): string => '(export "memory" (memory $0))';

export const emitWatExport = (path: string[], what: string, name: string): string => {
  const formattedPath = path.map(x => `"${x}"`).join(" ");
  return `(export ${formattedPath} (${what} $${name}))`;
};

export const emitWat = (ast: TransformedProgram): string => {
  const declaredFunctionNames = new Set<string>(ast.map(x => x.name));
  const calledFunctions: { [fnName: string]: FunctionCallNode } = ast
    .reduce<FunctionCallNode[]>(
      (calledFns, fnNode) => [
        ...calledFns,
        ...(fnNode.body.filter(x => x.type === "call") as FunctionCallNode[])
      ],
      [] as FunctionCallNode[]
    )
    .reduce((calledFns, fn) => Object.assign(calledFns, { [fn.name]: fn }), {});
  const importedFunctions = Object.keys(calledFunctions)
    .filter(fnName => !declaredFunctionNames.has(fnName))
    .map(fnName => calledFunctions[fnName]);

  const watImports = importedFunctions.map(fn => emitWatImport(["env", fn.name], fn));
  return emitWatModule([
    ...watImports
  ]);
};
