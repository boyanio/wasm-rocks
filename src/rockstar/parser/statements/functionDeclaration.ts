import { FunctionDeclaration, Variable, Statement } from "../../ast";
import { identifier, variable, simpleExpression } from "../expressions/expression";
import { comment } from "./comment";
import {
  $1,
  $2,
  sequence,
  anyWord,
  zeroOrMany,
  anyOf,
  nextLineOrEOF,
  word,
  batch,
  emptyLine,
  wordSequence,
  optional
} from "../parsers";
import { assignment } from "./assignment";
import { variableDeclaration } from "./variableDeclaration";
import { incrementDecrement } from "./incrementDecrement";
import { arithmeticRounding } from "./arithmeticRounding";
import { io } from "./io";
import { ifStatement } from "./ifStatement";
import { loop } from "./loop";
import { Parser } from "../types";

const statement = anyOf<Statement>(
  ifStatement,
  loop,
  comment,
  assignment,
  variableDeclaration,
  incrementDecrement,
  arithmeticRounding,
  io
);

type FunctionHeader = [string, Variable[]];

const functionHeader: Parser<FunctionHeader> = nextLineOrEOF(
  sequence(
    (name, firstArg, restArgs) => [name, [firstArg, ...restArgs]],
    batch($1, identifier, word("takes")),
    variable,
    zeroOrMany(sequence($2, anyWord("and", "&", "'n'", ","), variable))
  )
);

const functionBody = zeroOrMany(anyOf(statement, optional(nextLineOrEOF(emptyLine))));

const functionFooter = nextLineOrEOF(sequence($2, wordSequence("Give", "back"), simpleExpression));

/**
 * Parses a function
 *
 *    <name> takes <arg0>( and|&|'n' <arg1>)*
 *    <statements>
 *    <blank line>
 *    Give back <expr>
 */
export const functionDeclaration = nextLineOrEOF(
  sequence(
    ([name, args], statements, result) =>
      ({
        type: "function",
        name,
        args,
        result,
        statements: statements.filter(x => x)
      } as FunctionDeclaration),
    functionHeader,
    functionBody,
    functionFooter,
    nextLineOrEOF(emptyLine)
  )
);
