import { Expression, Operator, UnaryOperator, BinaryOperator } from "../ast";

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

const findLowestPrecedenceOperator = (arr: (Operator | Expression)[]): [Operator, number] => {
  let opIdx = arr.findIndex(isOperator);
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
export const createOperatorPrecedenceTree = (arr: (Operator | Expression)[]): Expression => {
  if (arr.length === 1) return arr[0] as Expression;

  const [operator, opIdx] = findLowestPrecedenceOperator(arr);
  const rtl = isRightToLeft(operator);
  if (rtl) {
    return {
      type: "unaryExpression",
      operator: operator as UnaryOperator,
      rhs: createOperatorPrecedenceTree(arr.slice(opIdx + 1))
    };
  } else {
    return {
      type: "binaryExpression",
      operator: operator as BinaryOperator,
      lhs: createOperatorPrecedenceTree(arr.slice(0, opIdx)),
      rhs: createOperatorPrecedenceTree(arr.slice(opIdx + 1))
    };
  }
};
