import { Program, FunctionDeclarationNode } from "./parser";

export const transform = (ast: Program): Program => {
  
  if (!ast.find(a => a.type === "function" && (<FunctionDeclarationNode>a).name === "main")) {
    const fnNodes = ast.filter(a => a.type === "function");
    const nonFnNodes = ast.filter(a => a.type !== "function");
    const mainNode = new FunctionDeclarationNode("main", nonFnNodes);
    ast = [mainNode, ...fnNodes];
  }

  return ast;
};
