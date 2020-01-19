import { Parser } from "../types";
import { IOOperation } from "../../ast";
import { simpleExpression } from "../expressions/expression";
import { sequence, anyWord } from "../parsers";

const say: Parser<IOOperation> = sequence(
  (_1, what) => ({
    type: "say",
    what
  }),
  anyWord("Shout", "Whisper", "Scream", "Say"),
  simpleExpression
);

export const io: Parser<IOOperation> = say;
