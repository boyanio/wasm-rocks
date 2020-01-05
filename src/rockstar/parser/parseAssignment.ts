import { Program, AssignmentNode, Parser } from "./types";
import { parseExpression, AssignmentType, parseVariableName } from "./parseExpression";
import { combineParsers } from "./combineParsers";

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
  const match = line.match(/^put (.+) into (.+)$/i);
  return match ? parseVariableAssignmentByType("put", match[2], match[1]) : null;
};

const parseLetVariableAssignment = (line: string): AssignmentNode | null => {
  const match = line.match(/^let (.+) be (.+)$/i);
  return match ? parseVariableAssignmentByType("let", match[1], match[2]) : null;
};

const parseVariableDeclaration: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(/^(.+)\s+(is|are|was|were|says)\s+(.+)/i);
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

export const parseAssignment: Parser = combineParsers([parseVariableDeclaration, parseVariableAssignment]);
