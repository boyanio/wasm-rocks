import {
  batch,
  word,
  $2,
  oneOrMany,
  nextLineOrEOF,
  sequence,
  anyOf,
  emptyLineOrEOF,
  optional
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

const statement = anyOf<Statement>(
  comment,
  assignment,
  variableDeclaration,
  incrementDecrement,
  arithmeticRounding,
  io
);

export const ifStatement: Parser<IfStatement> = batch(
  (condition: Expression, then: Statement[], _, $else: Statement[] | null) => ({
    type: "if",
    condition,
    then: { statements: then },
    else: $else ? { statements: $else } : null
  }),
  nextLineOrEOF(sequence($2, word("If"), expression)),
  oneOrMany(statement),
  emptyLineOrEOF,
  optional(sequence($2, nextLineOrEOF(word("Else")), oneOrMany(statement), emptyLineOrEOF))
);
