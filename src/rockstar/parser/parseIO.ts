import { Parser } from "./types";
import { SayCall, Scope } from "../ast";
import { parseSimpleExpression } from "./parseExpression";

const parseSay = (line: string): SayCall | null => {
  const match = line.match(/^(shout|whisper|say|scream) (["a-zA-Z0-9\s]+)/i);
  if (!match) return null;

  const what = parseSimpleExpression(match[2]);
  if (!what) return null;

  return {
    type: "say",
    what
  };
};

export const parseIO: Parser = (scope: Scope, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const node = parseSay(line);
  if (!node) return lineIndex;

  scope.statements.push(node);
  return lineIndex + 1;
};
