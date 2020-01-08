import { Program, Parser, SayCall } from "./types";
import { parseSimpleExpression } from "./parseExpression";

const parseSay = (line: string): SayCall | null => {
  const match = line.match(/^(shout|whisper|say|scream) (["a-zA-Z0-9\s]+)/i);
  if (!match) return null;

  const what = parseSimpleExpression(match[2]);
  if (!what) return null;

  return new SayCall(what);
};

export const parseIO: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const node = parseSay(line);
  if (node) {
    program.push(node);
    return lineIndex + 1;
  }

  return lineIndex;
};
