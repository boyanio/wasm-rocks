import { Program, FunctionDeclarationNode, StatementNode } from "./parser";

export type TransformedProgram = FunctionDeclarationNode[];

export const transform = (ast: Program): Program => {
  const { fnNodes, nonFnNodes } = ast.reduce(
    (split, node) =>
      Object.assign(
        split,
        node.type === "function"
          ? { fnNodes: [...split.fnNodes, node] }
          : { nonFnNodes: [...split.nonFnNodes, node] }
      ),
    { fnNodes: [] as FunctionDeclarationNode[], nonFnNodes: [] as StatementNode[] }
  );

  const hasMainFn = fnNodes.find(node => node.name === "main") != null;
  if (hasMainFn && nonFnNodes.length > 0)
    throw new Error(
      "Having both global statements and a `main` function is not allowed.\n" +
        "Either move the global statements in the `main` function, or choose another name for it."
    );

  let transformedAst = fnNodes;
  if (!hasMainFn) {
    const mainNode = new FunctionDeclarationNode("main", nonFnNodes);
    transformedAst = [mainNode, ...fnNodes];
  }

  return transformedAst;
};
