import { Program, AssignmentNode, Parser, BinaryExpressionNode, IdentifierNode, NumberLiteralNode } from "./types";
import { parseExpression, AssignmentType, parseVariableName } from "./parseExpression";
import { combineParsers } from "./combineParsers";
import { countOccurrences } from "../../string-utils";

const parseVariableAssignmentByType = (
  assignment: AssignmentType,
  variableExpression: string,
  expression: string
): AssignmentNode | null => {
  const variable = parseVariableName(variableExpression);
  if (!variable) return null;

  const expressionNode = parseExpression(variable, assignment, expression);
  if (!expressionNode) return null;

  return new AssignmentNode(variable, expressionNode);
};

const parsePutVariableAssignment = (line: string): AssignmentNode | null => {
  const match = line.match(/^put (.+?) into (.+)$/i);
  return match ? parseVariableAssignmentByType("put", match[2], match[1]) : null;
};

const parseLetVariableAssignment = (line: string): AssignmentNode | null => {
  const match = line.match(/^let (.+?) be (.+)$/i);
  return match ? parseVariableAssignmentByType("let", match[1], match[2]) : null;
};

const parseVariableDeclaration: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^(.+?)\s+(is|are|was|were|says)\s+(.+)/i);
  if (!match) return lineIndex;

  const assignment = match[2].toLowerCase() as AssignmentType;
  const node = parseVariableAssignmentByType(assignment, match[1], match[3]);
  if (!node) return lineIndex;

  program.push(node);
  return lineIndex + 1;
};

const parseVariableAssignment: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const node = parsePutVariableAssignment(line) || parseLetVariableAssignment(line);
  if (!node) return lineIndex;

  program.push(node);
  return lineIndex + 1;
};

const parseVariableIncrement: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^build (.+?) ((up)($|,|,?\s+))+/i);
  if (!match) return lineIndex;

  const variable = parseVariableName(match[1]);
  if (!variable) return lineIndex;

  const change = countOccurrences(line, " up");

  program.push(
    new AssignmentNode(
      variable,
      new BinaryExpressionNode("add", new IdentifierNode(variable), new NumberLiteralNode(change))
    )
  );
  return lineIndex + 1;
};

const parseVariableDecrement: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^knock (.+?) ((down)($|,|,?\s+))+/i);
  if (!match) return lineIndex;

  const variable = parseVariableName(match[1]);
  if (!variable) return lineIndex;

  const change = countOccurrences(line, " down");

  program.push(
    new AssignmentNode(
      variable,
      new BinaryExpressionNode("subtract", new IdentifierNode(variable), new NumberLiteralNode(change))
    )
  );
  return lineIndex + 1;
};

export const parseAssignment: Parser = combineParsers([
  parseVariableDeclaration,
  parseVariableAssignment,
  parseVariableIncrement,
  parseVariableDecrement
]);
