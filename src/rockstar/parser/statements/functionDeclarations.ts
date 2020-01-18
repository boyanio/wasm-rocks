import { Parser } from "../types";
import { FunctionDeclaration, NamedVariable, Statement } from "../../ast";
import { identifier, namedVariable, simpleExpression } from "../expressions/expression";
import { comment } from "./comment";
import {
  sequence,
  anyWord,
  zeroOrMany,
  $2,
  anyOf,
  toNextLine,
  $3,
  word,
  batch,
  $1,
  emptyLine
} from "../parsers";
import { assignment } from "./assignment";
import { variableDeclaration } from "./variableDeclaration";
import { incrementDecrement } from "./incrementDecrement";
import { arithmeticRounding } from "./arithmeticRounding";
import { io } from "./io";

export const statement = toNextLine(
  anyOf<Statement>(
    comment,
    assignment,
    variableDeclaration,
    incrementDecrement,
    arithmeticRounding,
    io
  )
);

const functionHeader = toNextLine(
  sequence(
    (name, firstArg, restArgs) => [name, [firstArg, ...restArgs]],
    batch($1, identifier, word("takes")),
    namedVariable,
    zeroOrMany(sequence($2, anyWord("and", "&", "'n'", ","), namedVariable))
  )
);

const functionBody = sequence($1, zeroOrMany(statement), toNextLine(emptyLine));

const functionFooter = toNextLine(batch($3, word("Give"), word("back"), simpleExpression));

/**
 * Parses a function
 *
 *    <name> takes <arg0>( and|&|'n' <arg1>)*
 *    <statements>
 *    Give back <expr>
 */
export const functionDeclaration: Parser<FunctionDeclaration> = toNextLine(
  sequence(
    ([name, args], statements, result) => ({
      type: "function",
      name: name as string,
      args: args as NamedVariable[],
      result,
      statements
    }),
    functionHeader,
    functionBody,
    functionFooter
  )
);
