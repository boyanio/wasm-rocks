import { Parser } from "../types";
import { IOOperation } from "../../ast";
import { simpleExpression, variable } from "../expressions/expression";
import { sequence, anyWord, wordSequence, anyOf, punctuation, $1, nextLineOrEOF } from "../parsers";

const listen: Parser<IOOperation> = sequence(
  (_1, to) => ({
    type: "listen",
    to
  }),
  wordSequence("Listen", "to"),
  variable
);

const say: Parser<IOOperation> = sequence(
  (_1, what) => ({
    type: "say",
    what
  }),
  anyWord("Shout", "Whisper", "Scream", "Say"),
  simpleExpression
);

export const io = nextLineOrEOF(sequence($1, anyOf(say, listen), punctuation));
