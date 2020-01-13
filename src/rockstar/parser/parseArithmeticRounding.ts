import {
  Program,
  ArithmeticRoundingOperation,
  Identifier,
  RoundOperation,
  RoundUpOperation,
  RoundDownOperation,
  Pronoun
} from "../ast";
import { parseVariable, isPronoun } from "./parseExpression";
import { combineParsers } from "./combineParsers";
import { Parser } from "./types";

const createArithmeticRoundingOperation = (
  rounding: string,
  target: Identifier
): ArithmeticRoundingOperation => {
  switch (rounding.toLowerCase()) {
    case "around":
    case "round": {
      const operation: RoundOperation = {
        type: "round",
        target
      };
      return operation;
    }

    case "up": {
      const operation: RoundUpOperation = {
        type: "roundUp",
        target
      };
      return operation;
    }
    case "down": {
      const operation: RoundDownOperation = {
        type: "roundDown",
        target
      };
      return operation;
    }
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

  const variable = parseVariable(match[2]);
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
