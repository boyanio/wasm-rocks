import { Parser } from "./types";
import { parseVariable, parseSimpleExpression, parseArithmeticExpression } from "./parseExpression";
import {
  SimpleAssignment,
  Program,
  CompoundAssignment,
  ArithmeticOperator,
  Identifier,
  Assignment
} from "../ast";

const compoundAssignmentParser = (pattern: RegExp, operator: ArithmeticOperator) => (
  input: string,
  target: Identifier
): CompoundAssignment | null => {
  const match = input.match(pattern);
  if (!match) return null;

  const right = parseSimpleExpression(match[2]);
  if (!right) return null;

  const compoundAssignment: CompoundAssignment = {
    type: "compoundAssignment",
    target,
    operator,
    right
  };
  return compoundAssignment;
};

const compoundAssignmentParsers = [
  compoundAssignmentParser(/^(without|minus) (.+)$/i, "subtract"),
  compoundAssignmentParser(/^(of|times) (.+)$/i, "multiply"),
  compoundAssignmentParser(/^(over) (.+)$/i, "divide"),
  compoundAssignmentParser(/^(plus|with) (.+)$/i, "add")
];
const parseCompoundAssignment = (input: string, target: Identifier): CompoundAssignment | null =>
  compoundAssignmentParsers.reduce<CompoundAssignment | null>(
    (node, parser) => node || parser(input, target),
    null
  );

const parseSimpleAssignment = (input: string, target: Identifier): SimpleAssignment | null => {
  const expression = parseArithmeticExpression(input) || parseSimpleExpression(input);
  if (!expression) return null;

  const simpleAssignment: SimpleAssignment = {
    type: "simpleAssignment",
    target,
    expression
  };
  return simpleAssignment;
};

const parsePutAssignment = (line: string): Assignment | null => {
  const match = line.match(/^put (.+?) into (.+)$/i);
  if (!match) return null;

  const target = parseVariable(match[2]);
  if (!target) return null;

  return parseSimpleAssignment(match[1], target);
};

const parseLetAssignment = (line: string): Assignment | null => {
  const match = line.match(/^let (.+?) be (.+)$/i);
  if (!match) return null;

  const target = parseVariable(match[1]);
  if (!target) return null;

  return parseCompoundAssignment(match[2], target) || parseSimpleAssignment(match[2], target);
};

/**
 * Parses a Let/Put assignment
 *
 *    Let <variable> be <expression>
 *    Put <expression> into <variable>
 */
export const parseAssignment: Parser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];

  const node = parsePutAssignment(line) || parseLetAssignment(line);
  if (!node) return lineIndex;

  program.push(node);
  return lineIndex + 1;
};
