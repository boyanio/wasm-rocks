import {
  batch,
  $2,
  oneOrMany,
  nextLineOrEOF,
  sequence,
  anyOf,
  emptyLineOrEOF,
  anyWord
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

const statement = anyOf<Statement>(
  comment,
  assignment,
  variableDeclaration,
  incrementDecrement,
  arithmeticRounding,
  io
);

/**
 * Parses loops
 *
 *    While <condition>
 *    <statements>
 *
 *    Until <condition>
 *    <statements>
 */
export const loop: Parser<Loop> = batch(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (condition: Expression, statements: Statement[], _) => ({
    type: "loop",
    condition,
    block: { statements }
  }),
  nextLineOrEOF(sequence($2, anyWord("While", "Until"), expression)),
  oneOrMany(statement),
  emptyLineOrEOF
);
