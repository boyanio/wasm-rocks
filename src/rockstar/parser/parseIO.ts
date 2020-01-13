import { Parser } from "./types";
import { Program, SayCall } from "../ast";
import { parseSimpleExpression } from "./parseExpression";

const parseSay = (line: string): SayCall | null => {
  const match = line.match(/^(shout|whisper|say|scream) (["a-zA-Z0-9\s]+)/i);
  if (!match) return null;

  const what = parseSimpleExpression(match[2]);
  if (!what) return null;

  const say: SayCall = {
    type: "say",
    what
  };
  return say;
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
