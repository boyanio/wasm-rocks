import { ArithmeticRoundingOperation, ArithmeticRoundingDirection } from "../../ast";
import { pronoun, namedVariable } from "../expressions/expression";
import { Parser } from "../types";
import { anyOf, sequence, word, keysOf, $2, batch } from "../parsers";

type ArithmeticRoundingDirections = { [key: string]: ArithmeticRoundingDirection };
const arithmeticRoundingDirections: ArithmeticRoundingDirections = {
  around: "upOrDown",
  round: "upOrDown",
  up: "up",
  down: "down"
};

const namedVariableRounding: Parser<ArithmeticRoundingOperation> = sequence(
  (direction, target) => ({
    type: "round",
    direction,
    target
  }),
  batch($2, word("Turn"), keysOf(arithmeticRoundingDirections)),
  namedVariable
);

const pronounRounding: Parser<ArithmeticRoundingOperation> = sequence(
  (target, direction) => ({
    type: "round",
    direction,
    target
  }),
  batch($2, word("Turn"), pronoun),
  keysOf(arithmeticRoundingDirections)
);

/**
 * Parses arithmetic rounding
 *
 *    Turn [up|down|round|around] <variable>
 *    Turn <pronoun> [up|down|round|around]
 */
export const arithmeticRounding: Parser<ArithmeticRoundingOperation> = anyOf(
  pronounRounding,
  namedVariableRounding
);
