import {
  Expression,
  ExpressionType,
  Literal,
  VariableDeclaration,
  Variable,
  Assignment,
  Statement,
  BinaryExpression,
  BinaryOperator,
  ArithmeticOperator,
  FunctionDeclaration
} from "./ast";
import { isInt } from "../../src/utils/number-utils";
import { findReversed } from "../../src/utils/array-utils";

export const resolveExpressionType = (
  expression: Expression,
  scope: Statement[],
  functions: FunctionDeclaration[]
): ExpressionType => {
  const isNumber = (expressionType: ExpressionType): boolean =>
    expressionType === "integer" || expressionType === "float";

  const findLastVariableDeclarationOrAssignment = (name?: string): Statement => {
    const statement = findReversed(scope, x => {
      switch (x.type) {
        case "variableDeclaration": {
          const statement = x as VariableDeclaration;
          return !name || statement.variable.name === name;
        }

        case "assignment": {
          const statement = x as Assignment;
          return !name || statement.target.name === name;
        }
      }

      return false;
    });

    if (!statement)
      throw new Error(
        `Cannot find variable declaration or assignment for ${
          name ? 'variable "' + name + '"' : "pronoun"
        }`
      );

    return statement;
  };

  const resolveLiteral = (literal: Literal): ExpressionType =>
    literal.type === "number" ? (isInt(literal.value) ? "integer" : "float") : literal.type;

  const resolveVariableDeclaration = (variableDeclaration: VariableDeclaration): ExpressionType =>
    resolveLiteral(variableDeclaration.value);

  const resolveAssignment = (assignment: Assignment): ExpressionType =>
    resolveExpressionType(assignment.expression, scope, functions);

  const resolveVariable = (variable: Variable): ExpressionType => {
    const statement = findLastVariableDeclarationOrAssignment(variable.name);

    if (statement.type === "variableDeclaration")
      return resolveVariableDeclaration(statement as VariableDeclaration);

    return resolveAssignment(statement as Assignment);
  };

  const resolvePronoun = (): ExpressionType => {
    const statement = findLastVariableDeclarationOrAssignment();

    if (statement.type === "variableDeclaration")
      return resolveVariableDeclaration(statement as VariableDeclaration);

    return resolveAssignment(statement as Assignment);
  };

  const compareArithmeticExpressionTypes = (
    operator: ArithmeticOperator,
    lhs: ExpressionType,
    rhs: ExpressionType
  ): ExpressionType => {
    if (lhs === "integer" && rhs === "integer") return "integer";
    if (lhs === "float" && isNumber(rhs)) return "float";
    if (isNumber(lhs) && rhs === "float") return "float";
    if (lhs === "string" && operator === "add") return "string";
    if (lhs === "string" && rhs === "integer" && operator === "multiply") return "string";

    throw new Error(`Cannot resolve expression: ${lhs} ${operator} ${rhs}`);
  };

  const compareExpressionTypes = (
    operator: BinaryOperator,
    lhs: ExpressionType,
    rhs: ExpressionType
  ): ExpressionType => {
    const isArithmeticOperator = ([
      "add",
      "divide",
      "multiply",
      "subtract"
    ] as BinaryOperator[]).includes(operator);
    if (isArithmeticOperator)
      return compareArithmeticExpressionTypes(operator as ArithmeticOperator, lhs, rhs);

    return "boolean";
  };

  switch (expression.type) {
    case "boolean":
    case "string":
    case "number":
    case "null":
    case "mysterious":
      return resolveLiteral(expression as Literal);

    case "variable":
      return resolveVariable(expression as Variable);

    case "pronoun":
      return resolvePronoun();

    case "binaryExpression": {
      const binaryExpression = expression as BinaryExpression;
      const lhs = resolveExpressionType(binaryExpression.lhs, scope, functions);
      const rhs = resolveExpressionType(binaryExpression.rhs, scope, functions);
      return compareExpressionTypes(binaryExpression.operator, lhs, rhs);
    }

    case "unaryExpression":
      return "boolean";

    case "functionCall":
      return "integer";
  }
};
