import { Parser } from "../types";
import { namedVariable, expression } from "../expressions/expression";
import { Assignment, BinaryOperator, Expression, NamedVariable } from "../../ast";
import { anyOf, sequence, keysOf, word } from "../parsers";

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
  target: NamedVariable,
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
  namedVariable
);

const letAssignment: Parser<Assignment> = sequence(
  (_1, target, _3, expression) => ({
    type: "assignment",
    target,
    expression: convertTemporaryExpression(target, expression)
  }),
  word("Let"),
  namedVariable,
  word("be"),
  anyOf<CompoundAssignment | Expression>(compoundAssignment, expression)
);

/**
 * Parses a Let/Put assignment
 *
 *    Let <variable> be <expression>
 *    Put <expression> into <variable>
 */
export const assignment: Parser<Assignment> = anyOf(putAssignment, letAssignment);
