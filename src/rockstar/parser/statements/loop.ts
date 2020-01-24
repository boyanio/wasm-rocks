import {
  batch,
  $2,
  oneOrMany,
  sequence,
  anyOf,
  emptyLineOrEOF,
  anyWord,
  nextLine
} from "../parsers";
import { expression } from "../expressions/expression";
import { Expression, Statement, Loop } from "src/rockstar/ast";
import { Parser } from "../types";
import { comment } from "./comment";
import { incrementDecrement } from "./incrementDecrement";
import { arithmeticRounding } from "./arithmeticRounding";
import { assignment } from "./assignment";
import { variableDeclaration } from "./variableDeclaration";
import { io } from "./io";
import { ifStatement } from "./ifStatement";
import { $break, $continue } from "./break";

const statement = anyOf<Statement | null>(
  comment,
  assignment,
  variableDeclaration,
  incrementDecrement,
  arithmeticRounding,
  io,
  ifStatement,
  $break,
  $continue
);

/**
 * Parses loops
 *
 *    While/Until <condition>
 *    <statement0>
 *    <statement1>
 *    ...
 *    <blankLine/EOF>
 */
export const loop: Parser<Loop> = batch(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (condition: Expression, statements: (Statement | null)[], _) => ({
    type: "loop",
    condition,
    body: { statements: statements.filter(x => x) as Statement[] }
  }),
  nextLine(sequence($2, anyWord("While", "Until"), expression)),
  oneOrMany(statement),
  emptyLineOrEOF
);
