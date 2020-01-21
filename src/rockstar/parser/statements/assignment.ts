import { Parser } from "../types";
import { variable, expression } from "../expressions/expression";
import { Assignment, BinaryOperator, Expression, Variable } from "../../ast";
import { anyOf, sequence, keysOf, word, punctuation, $1, nextLineOrEOF } from "../parsers";

type CompoundAssignment = {
  type: "compoundAssignment";
  operator: BinaryOperator;
  expression: Expression;
};

type CompoundAssignmentOperators = { [key: string]: BinaryOperator };
const compoundAssignmentOperators: CompoundAssignmentOperators = {
  without: "subtract",
  minus: "subtract",
  of: "multiply",
  times: "multiply",
  over: "divide",
  plus: "add",
  with: "add"
};

const compoundAssignment: Parser<CompoundAssignment> = sequence(
  (operator, expression) => ({
    type: "compoundAssignment",
    operator,
    expression
  }),
  keysOf(compoundAssignmentOperators),
  expression
);

const convertTemporaryExpression = (
  target: Variable,
  expression: CompoundAssignment | Expression
): Expression => {
  if (expression.type === "compoundAssignment") {
    return {
      type: "binaryExpression",
      operator: expression.operator,
      lhs: target,
      rhs: expression.expression
    };
  }
  return expression;
};

const putAssignment: Parser<Assignment> = sequence(
  (_1, expression, _3, target) => ({
    type: "assignment",
    target,
    expression
  }),
  word("Put"),
  expression,
  word("into"),
  variable
);

const letAssignment: Parser<Assignment> = sequence(
  (_1, target, _3, expression) => ({
    type: "assignment",
    target,
    expression: convertTemporaryExpression(target, expression)
  }),
  word("Let"),
  variable,
  word("be"),
  anyOf<CompoundAssignment | Expression>(compoundAssignment, expression)
);

/**
 * Parses a Let/Put assignment
 *
 *    Let <variable> be <expression>
 *    Put <expression> into <variable>
 */
export const assignment = nextLineOrEOF(
  sequence($1, anyOf(putAssignment, letAssignment), punctuation)
);
