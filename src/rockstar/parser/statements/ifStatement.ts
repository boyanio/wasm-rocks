import {
  batch,
  word,
  $2,
  oneOrMany,
  nextLineOrEOF,
  sequence,
  anyOf,
  emptyLineOrEOF,
  optional,
  nextLine
} from "../parsers";
import { expression } from "../expressions/expression";
import { IfStatement, Expression, Statement } from "src/rockstar/ast";
import { Parser } from "../types";
import { comment } from "./comment";
import { incrementDecrement } from "./incrementDecrement";
import { arithmeticRounding } from "./arithmeticRounding";
import { assignment } from "./assignment";
import { variableDeclaration } from "./variableDeclaration";
import { io } from "./io";
import { $continue, $break } from "./break";

const statement = anyOf<Statement | null>(
  comment,
  assignment,
  variableDeclaration,
  incrementDecrement,
  arithmeticRounding,
  io,
  $break,
  $continue
);

/**
 * Parses if statements
 *
 *    If <expression>
 *    <statement0>
 *    <statement1>
 *    ...
 *    <blankLine/EOF>
 *
 *    If <expression>
 *    <statement0>
 *    <statement1>
 *    ...
 *    <blankLine>
 *    Else
 *    <statement0>
 *    <statement1>
 *    ...
 *    <blankLine/EOF>
 */
export const ifStatement: Parser<IfStatement> = batch(
  (condition: Expression, then: (Statement | null)[], _, $else: (Statement | null)[] | null) => ({
    type: "if",
    condition,
    then: { statements: then.filter(x => x) as Statement[] },
    $else: $else ? { statements: $else as Statement[] } : undefined
  }),
  nextLine(sequence($2, word("If"), expression)),
  oneOrMany(statement),
  emptyLineOrEOF,
  optional(sequence($2, nextLineOrEOF(word("Else")), oneOrMany(statement), emptyLineOrEOF))
);
