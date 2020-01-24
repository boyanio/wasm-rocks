import { nextLineOrEOF, sequence, anyOf, punctuation, word, wordSequence } from "../parsers";
import { BreakStatement, ContinueStatement } from "src/rockstar/ast";
import { Parser } from "../types";

export const $break: Parser<BreakStatement> = nextLineOrEOF(
  sequence(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_, __) => ({ type: "break" }),
    anyOf(wordSequence("Break", "it", "down"), word("Break")),
    punctuation
  )
);

export const $continue: Parser<ContinueStatement> = nextLineOrEOF(
  sequence(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_, __) => ({ type: "continue" }),
    anyOf(wordSequence("Take", "it", "to", "the", "top"), word("Continue")),
    punctuation
  )
);
