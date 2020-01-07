import { Program, FunctionDeclaration, Statement, NumberLiteral } from "./parser";

export type TransformedProgram = FunctionDeclaration[];

export const transform = (ast: Program): TransformedProgram => {
  const { fnNodes, nonFnNodes } = ast.reduce(
    (split, node) =>
      Object.assign(
        split,
        node.type === "function"
          ? { fnNodes: [...split.fnNodes, node] }
          : { nonFnNodes: [...split.nonFnNodes, node] }
      ),
    { fnNodes: [] as FunctionDeclaration[], nonFnNodes: [] as Statement[] }
  );

  const hasMainFn = fnNodes.find(node => node.name === "main") != null;
  if (hasMainFn && nonFnNodes.length > 0)
    throw new Error(
      "Having both global statements and a `main` function is not allowed.\n" +
        "Either move the global statements in the `main` function, or choose another name for it."
    );

  let transformedAst = fnNodes;
  if (!hasMainFn) {
    const mainNode = new FunctionDeclaration("main", [], new NumberLiteral(0), nonFnNodes);
    transformedAst = [mainNode, ...fnNodes];
  }

  return transformedAst;
};
