import { Program, Parser, Pronoun, InPlaceMutation, InPlaceMutationType } from "./types";
import { parseVariable, isPronoun, parsePronoun } from "./parseExpression";
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
    Array.from(Array(change)).map(() => new InPlaceMutation("buildUp", identifier))
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
    Array.from(Array(change)).map(() => new InPlaceMutation("knockDown", identifier))
  );
  return lineIndex + 1;
};

const parseInPlaceMutationType = (input: string): InPlaceMutationType => {
  switch (input) {
    case "around":
    case "round":
      return "turnRound";
    case "up":
      return "turnUp";
    case "down":
      return "turnDown";
    default:
      throw new Error(`Unknown turning: ${input}`);
  }
};

const parseVariableRounding: Parser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];

  const match = line.match(/^turn (around|round|up|down) (.+)/i);
  if (!match) return lineIndex;

  const variable = parseVariable(match[2]);
  if (!variable) return lineIndex;

  const operationType = parseInPlaceMutationType(match[1]);
  program.push(new InPlaceMutation(operationType, variable));
  return lineIndex + 1;
};

const parsePronounRounding: Parser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];

  const match = line.match(/^turn (.+?) (around|round|up|down)\W*/i);
  if (!match) return lineIndex;

  if (!isPronoun(match[1])) return lineIndex;

  const operationType = parseInPlaceMutationType(match[2]);
  program.push(new InPlaceMutation(operationType, new Pronoun()));
  return lineIndex + 1;
};

export const parseInPlaceMutation: Parser = combineParsers([
  parseIncrement,
  parseDecrement,
  parseVariableRounding,
  parsePronounRounding
]);
