import { Program, Parser, ExplicitIdentifierNode, FunctionCallNode, ImplicitIdentifierNode } from "./types";
import { parseVariableName, pronouns } from "./parseExpression";

type FunctionCallParser = (line: string) => FunctionCallNode | null;

const explicitArgumentFunctionCallParser = (fn: string, pattern: RegExp): FunctionCallParser => (
  line: string
): FunctionCallNode | null => {
  const match = line.match(pattern);
  if (!match) return null;

  const variable = parseVariableName(match[1]);
  if (!variable) return null;

  return new FunctionCallNode(fn, [new ExplicitIdentifierNode(variable)]);
};

const implicitArgumentFunctionCallParser = (fn: string, pattern: RegExp): FunctionCallParser => (
  line: string
): FunctionCallNode | null => {
  const match = line.match(pattern);
  if (!match) return null;

  return new FunctionCallNode(fn, [new ImplicitIdentifierNode()]);
};

const parsers: FunctionCallParser[] = [
  explicitArgumentFunctionCallParser("say", /^shout (.+)/i),
  implicitArgumentFunctionCallParser("say", new RegExp(`^shout (${pronouns.join("|")})\\W*`, "i"))
];

export const parseFunctionCall: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  for (const parser of parsers) {
    const node = parser(line);
    if (node) {
      program.push(node);
      return lineIndex + 1;
    }
  }

  return lineIndex;
};
