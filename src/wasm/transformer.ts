import { Program, FunctionDeclaration, Statement, ProgramNode } from "../rockstar/parser";

export class MainProcedure extends ProgramNode {
  constructor(public name: string, public body: Statement[]) {
    super("main");
  }

  toString(): string {
    return `${this.name} { body = [${this.body.join(", ")}] }`;
  }
}

export type TransformedProgram = (MainProcedure | FunctionDeclaration)[];

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
  if (hasMainFn && nonFnNodes.length > 0) throw new Error("The function name `main` is reserved.");

  let transformedAst: TransformedProgram = fnNodes;
  if (!hasMainFn) {
    const mainNode = new MainProcedure("main", nonFnNodes);
    transformedAst = [mainNode, ...fnNodes];
  }

  return transformedAst;
};
