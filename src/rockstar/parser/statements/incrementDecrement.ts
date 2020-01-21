import { Parser } from "../types";
import { IncrementOperation, DecrementOperation, Pronoun, Variable } from "../../ast";
import { variable, pronoun } from "../expressions/expression";
import { sequence, punctuation, anyOf, zeroOrMany, word, $1, nextLineOrEOF } from "../parsers";

const increment: Parser<IncrementOperation> = sequence(
  (_1, target, _3, restUps) => ({
    type: "increment",
    target,
    times: 1 + restUps.filter(x => x).length
  }),
  word("Build"),
  anyOf<Variable | Pronoun>(pronoun, variable),
  word("up"),
  zeroOrMany(anyOf(punctuation, word("up")))
);

const decrement: Parser<DecrementOperation> = sequence(
  (_1, target, _3, restDowns) => ({
    type: "decrement",
    target,
    times: 1 + restDowns.filter(x => x).length
  }),
  word("Knock"),
  anyOf<Variable | Pronoun>(pronoun, variable),
  word("down"),
  zeroOrMany(anyOf(punctuation, word("down")))
);

/**
 * Parses increment/decrement operations
 *
 *    Build <variable | pronoun> up[,? up]*
 *    Knock <variable | pronoun> down[,? down]*
 */
export const incrementDecrement = nextLineOrEOF(
  sequence($1, anyOf<IncrementOperation | DecrementOperation>(increment, decrement), punctuation)
);
