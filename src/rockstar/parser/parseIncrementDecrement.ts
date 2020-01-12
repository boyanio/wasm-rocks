import { Program, Parser, IncrementOperation, DecrementOperation } from "./types";
import { parseVariable, parsePronoun } from "./parseExpression";
import { combineParsers } from "./combineParsers";
import { countOccurrences } from "../../utils/string-utils";

const parseIncrement: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^build (.+?) ((up)($|,|,?\s+))+/i);
  if (!match) return lineIndex;

  const identifier = parsePronoun(match[1]) || parseVariable(match[1]);
  if (!identifier) return lineIndex;

  const change = countOccurrences(line, " up");
  Array.prototype.push.apply(
    program,
    Array.from(Array(change)).map(() => new IncrementOperation(identifier))
  );
  return lineIndex + 1;
};

const parseDecrement: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^knock (.+?) ((down)($|,|,?\s+))+/i);
  if (!match) return lineIndex;

  const identifier = parsePronoun(match[1]) || parseVariable(match[1]);
  if (!identifier) return lineIndex;

  const change = countOccurrences(line, " down");
  Array.prototype.push.apply(
    program,
    Array.from(Array(change)).map(() => new DecrementOperation(identifier))
  );
  return lineIndex + 1;
};

/**
 * Parses increment/decrement operations
 *
 *    Build <variable | pronoun> up[, up]*
 *    Turn <variable | pronoun> down[, down]*
 */
export const parseIncrementDecrement: Parser = combineParsers([parseIncrement, parseDecrement]);
