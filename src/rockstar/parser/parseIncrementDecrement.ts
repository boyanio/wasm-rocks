import { Parser } from "./types";
import { IncrementOperation, DecrementOperation, Scope } from "../ast";
import { parseNamedVariable, parsePronoun } from "./parseExpression";
import { combineParsers } from "./combineParsers";
import { countOccurrences } from "../../utils/string-utils";

const parseIncrement: Parser = (scope: Scope, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^build (.+?) ((up)($|,|,?\s+))+/i);
  if (!match) return lineIndex;

  const target = parsePronoun(match[1]) || parseNamedVariable(match[1]);
  if (!target) return lineIndex;

  const change = countOccurrences(line, " up");
  Array.prototype.push.apply(
    scope.statements,
    Array.from(Array(change)).map<IncrementOperation>(() => ({ type: "increment", target }))
  );
  return lineIndex + 1;
};

const parseDecrement: Parser = (scope: Scope, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^knock (.+?) ((down)($|,|,?\s+))+/i);
  if (!match) return lineIndex;

  const target = parsePronoun(match[1]) || parseNamedVariable(match[1]);
  if (!target) return lineIndex;

  const change = countOccurrences(line, " down");
  Array.prototype.push.apply(
    scope.statements,
    Array.from(Array(change)).map<DecrementOperation>(() => ({ type: "decrement", target }))
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
