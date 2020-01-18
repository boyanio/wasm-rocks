import { Expression, Operator, UnaryOperator, BinaryOperator } from "../../ast";
import { ParseError, Parsed } from "../types";
import { isParseError } from "../parsers";

const operatorPrecedence = new Map<Operator, number>([
  ["or", 1],
  ["and", 2],
  ["nor", 3],
  ["equals", 6],
  ["notEquals", 6],
  ["greaterThan", 7],
  ["greaterThanOrEquals", 7],
  ["lowerThan", 7],
  ["lowerThanOrEquals", 7],
  ["add", 8],
  ["subtract", 8],
  ["multiply", 9],
  ["divide", 9],
  ["not", 10]
]);

const isRightToLeft = (operator: Operator): boolean => operator === "not";

const isOperator = (input: Operator | Expression): boolean => typeof input === "string";

const findLowestPrecedenceOperator = (
  arr: (Operator | Expression)[]
): [Operator, number] | null => {
  let opIdx = arr.findIndex(isOperator);
  if (opIdx < 0) return null;

  let op = arr[opIdx] as Operator;
  let opRank = operatorPrecedence.get(op) as number;

  for (let i = opIdx; i < arr.length; i++) {
    if (!isOperator(arr[i])) continue;

    const currentOp = arr[i] as Operator;
    const currentOpRank = operatorPrecedence.get(currentOp) as number;
    if (currentOpRank <= opRank) {
      op = currentOp;
      opRank = currentOpRank;
      opIdx = i;
    }
  }

  return [op, opIdx];
};

/**
 * Creates an operator precedence tree
 */
export const createOperatorPrecedenceTree = (
  arr: (Operator | Expression)[],
  toParseError: (message: string) => ParseError
): Parsed<Expression> => {
  if (!arr.length) return toParseError("Cannot parse expression");

  if (arr.length === 1)
    return isOperator(arr[0])
      ? toParseError(`Input array single value must be a node, operator encountered: ${arr[0]}`)
      : (arr[0] as Expression);

  const result = findLowestPrecedenceOperator(arr);
  if (!result) return toParseError("No operator found in sequence");

  const [operator, opIdx] = result;
  const rtl = isRightToLeft(operator);
  const rhs = createOperatorPrecedenceTree(arr.slice(opIdx + 1), toParseError);
  if (isParseError(rhs)) return rhs;

  if (rtl) {
    return {
      type: "unaryExpression",
      operator: operator as UnaryOperator,
      rhs: rhs as Expression
    };
  } else {
    const lhs = createOperatorPrecedenceTree(arr.slice(0, opIdx), toParseError);
    if (isParseError(lhs)) return lhs;

    return {
      type: "binaryExpression",
      operator: operator as BinaryOperator,
      lhs: lhs as Expression,
      rhs: rhs as Expression
    };
  }
};
