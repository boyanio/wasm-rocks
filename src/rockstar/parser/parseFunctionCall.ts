import { Program, Parser, FunctionCall } from "./types";
import { parseVariable, parsePronoun } from "./parseExpression";

type FunctionCallParser = (line: string) => FunctionCall | null;

const functionCallWithSingleArgumentParser = (
  functionName: string,
  pattern: RegExp,
  variableMatchIndex: number
): FunctionCallParser => (line: string): FunctionCall | null => {
  const match = line.match(pattern);
  if (!match) return null;

  const arg = parsePronoun(match[variableMatchIndex]) || parseVariable(match[variableMatchIndex]);
  if (!arg) return null;

  return new FunctionCall(functionName, [arg]);
};

const parsers: FunctionCallParser[] = [
  functionCallWithSingleArgumentParser("say", /^(shout|whisper|say|scream) ([a-zA-Z\s]+)/i, 2)
];

export const parseFunctionCall: Parser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
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
