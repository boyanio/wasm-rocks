import { Program, ArithmeticRoundingOperation, Pronoun, Variable } from "../ast";
import { parseNamedVariable, isPronoun } from "./parseExpression";
import { combineParsers } from "./combineParsers";
import { Parser } from "./types";

const createArithmeticRoundingOperation = (
  rounding: string,
  target: Variable
): ArithmeticRoundingOperation => {
  switch (rounding.toLowerCase()) {
    case "around":
    case "round":
      return {
        type: "round",
        target,
        direction: "upOrDown"
      };

    case "up":
      return {
        type: "round",
        target,
        direction: "up"
      };

    case "down":
      return {
        type: "round",
        target,
        direction: "down"
      };
  }

  throw new Error(`Unknown rounding: ${rounding}`);
};

const parseVariableRounding: Parser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];

  const match = line.match(/^turn (around|round|up|down) (.+)/i);
  if (!match) return lineIndex;

  const variable = parseNamedVariable(match[2]);
  if (!variable) return lineIndex;

  program.push(createArithmeticRoundingOperation(match[1], variable));
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

  const pronoun: Pronoun = {
    type: "pronoun"
  };
  program.push(createArithmeticRoundingOperation(match[2], pronoun));
  return lineIndex + 1;
};

/**
 * Parses arithmetic rounding
 *
 *    Turn [up|down|round|around] <variable>
 *    Turn <pronoun> [up|down|round|around]
 */
export const parseArithmeticRounding: Parser = combineParsers([
  parseVariableRounding,
  parsePronounRounding
]);
