import { createOperatorPrecedenceTree } from "../../../../src/rockstar/parser/expressions/operatorPrecedence";
import {
  BinaryOperator,
  BinaryExpression,
  UnaryOperator,
  UnaryExpression,
  NumberLiteral,
  Expression
} from "../../../../src/rockstar/ast";
import { ParseError } from "../../../../src/rockstar/parser";
import { parseError, isParseError } from "../../../../src/rockstar/parser/parsers";

const number = (num: number): NumberLiteral => ({ type: "number", value: num });

const binary = (operator: BinaryOperator, lhs: Expression, rhs: Expression): BinaryExpression => ({
  type: "binaryExpression",
  operator,
  lhs,
  rhs
});

const unary = (operator: UnaryOperator, rhs: Expression): UnaryExpression => ({
  type: "unaryExpression",
  operator,
  rhs
});

const toParserError = (message: string): ParseError =>
  parseError(message, { lineIndex: 0, offset: 0 });

describe("rockstar", () => {
  describe("parser", () => {
    describe("expressions", () => {
      describe("operator precedence", () => {
        it("creates precedence tree: 5", () => {
          const tree = createOperatorPrecedenceTree([number(5)], toParserError);
          expect(tree).toEqual(number(5));
        });

        it("creates precedence tree: 1 + 2", () => {
          const tree = createOperatorPrecedenceTree([number(1), "add", number(2)], toParserError);
          expect(tree).toEqual(binary("add", number(1), number(2)));
        });

        it("creates precedence tree: 1 / 2 - 5", () => {
          const tree = createOperatorPrecedenceTree(
            [number(1), "divide", number(2), "subtract", number(5)],
            toParserError
          );
          expect(tree).toEqual(
            binary("subtract", binary("divide", number(1), number(2)), number(5))
          );
        });

        it("creates precedence tree: 1 / 2 - !5 && 6", () => {
          const tree = createOperatorPrecedenceTree(
            [number(1), "divide", number(2), "subtract", "not", number(5), "and", number(6)],
            toParserError
          );
          expect(tree).toEqual(
            binary(
              "and",
              binary("subtract", binary("divide", number(1), number(2)), unary("not", number(5))),
              number(6)
            )
          );
        });

        it("creates parse error when input array is empty", () => {
          const tree = createOperatorPrecedenceTree([], toParserError);
          expect(isParseError(tree)).toBeTruthy();
        });

        it("creates parse error when the input array contains a single non-node element", () => {
          const tree = createOperatorPrecedenceTree(["add"], toParserError);
          expect(isParseError(tree)).toBeTruthy();
        });

        it("creates parse error when there is no operator in the input array", () => {
          const tree = createOperatorPrecedenceTree([number(1), number(2)], toParserError);
          expect(isParseError(tree)).toBeTruthy();
        });
      });
    });
  });
});
