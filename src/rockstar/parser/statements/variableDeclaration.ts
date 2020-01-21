import { Parser, Context, Parsed } from "../types";
import { VariableDeclaration, Literal } from "../../ast";
import { variable, literal } from "../expressions/expression";
import {
  anyOf,
  lineIndexWithinBounds,
  sequence,
  anyWord,
  pattern,
  map,
  word,
  batch,
  $1,
  punctuation,
  nextLineOrEOF
} from "../parsers";

const poeticStringLiteral = map(
  (value: string) => ({
    type: "string",
    value
  }),
  pattern(".+")
);

const withPoeticString: Parser<VariableDeclaration> = sequence(
  (variable, value) => ({
    type: "variableDeclaration",
    variable,
    value
  }),
  batch($1, variable, word("says")),
  poeticStringLiteral
);

const poeticNumberLiteral: Parser<Literal> = lineIndexWithinBounds(
  (lines: string[], context: Context): Parsed<Literal> => {
    let source = lines[context.lineIndex].substring(context.offset);

    // replace all dot occurrences, but the first one
    source = source.replace(/\./g, (match, offset, all) =>
      all.indexOf(".") === offset ? " . " : ""
    );

    // ignore all non-alphabetical characters
    source = source.replace(/[^A-Za-z0-9\s.-]/g, "");

    const module = (w: string): number => w.length % 10;
    const value = parseFloat(
      source
        .split(/\s+/)
        .reduce((result, word) => `${result}${word === "." ? "." : module(word)}`, "")
    );

    context.offset = lines[context.lineIndex].length;
    return { type: "number", value };
  }
);

const withNonStringPoeticLiteral: Parser<VariableDeclaration> = sequence(
  (variable, _2, value) => ({
    type: "variableDeclaration",
    variable,
    value
  }),
  variable,
  anyWord("is", "are", "was", "were"),
  anyOf(literal, poeticNumberLiteral)
);

export const variableDeclaration = nextLineOrEOF(
  sequence($1, anyOf(withPoeticString, withNonStringPoeticLiteral), punctuation)
);
