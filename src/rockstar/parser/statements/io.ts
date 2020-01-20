import { Parser } from "../types";
import { IOOperation } from "../../ast";
import { simpleExpression, namedVariable } from "../expressions/expression";
import { sequence, anyWord, wordSequence, anyOf } from "../parsers";

const listen: Parser<IOOperation> = sequence(
  (_1, to) => ({
    type: "listen",
    to
  }),
  wordSequence("Listen", "to"),
  namedVariable
);

const say: Parser<IOOperation> = sequence(
  (_1, what) => ({
    type: "say",
    what
  }),
  anyWord("Shout", "Whisper", "Scream", "Say"),
  simpleExpression
);

export const io: Parser<IOOperation> = anyOf(say, listen);
