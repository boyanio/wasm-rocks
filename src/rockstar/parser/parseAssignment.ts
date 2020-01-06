import {
  Program,
  AssignmentNode,
  Parser,
  BinaryExpressionNode,
  ExplicitIdentifierNode,
  NumberLiteralNode,
  FunctionCallNode,
  ImplicitIdentifierNode
} from "./types";
import { parseExpression, AssignmentType, parseVariableName } from "./parseExpression";
import { combineParsers } from "./combineParsers";
import { countOccurrences } from "../../string-utils";

const pronouns = ["it", "he", "she", "him", "her", "they", "them", "ze", "hir", "zie", "zir", "xe", "xem", "ve", "ver"];

const parseVariableAssignmentByType = (
  assignment: AssignmentType,
  variableExpression: string,
  expression: string
): AssignmentNode | null => {
  const variable = parseVariableName(variableExpression);
  if (!variable) return null;

  const expressionNode = parseExpression(variable, assignment, expression);
  if (!expressionNode) return null;

  return new AssignmentNode(new ExplicitIdentifierNode(variable), expressionNode);
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
      new ExplicitIdentifierNode(variable),
      new BinaryExpressionNode("add", new ExplicitIdentifierNode(variable), new NumberLiteralNode(change))
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
      new ExplicitIdentifierNode(variable),
      new BinaryExpressionNode("subtract", new ExplicitIdentifierNode(variable), new NumberLiteralNode(change))
    )
  );
  return lineIndex + 1;
};

const parseRoundingFunctionName = (input: string): string => {
  switch (input) {
    case "around":
    case "round":
      return "round";
    case "up":
      return "ceil";
    case "down":
      return "floor";
    default:
      throw new Error(`Unknown turning: ${input}`);
  }
};

const parseExplicitVariableRounding: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const varMatch = line.match(/^turn (around|round|up|down) (.+)/i);
  if (!varMatch) return lineIndex;

  const variable = parseVariableName(varMatch[2]);
  if (!variable) return lineIndex;

  const fn = parseRoundingFunctionName(varMatch[1]);

  program.push(
    new AssignmentNode(
      new ExplicitIdentifierNode(variable),
      new FunctionCallNode(fn, [new ExplicitIdentifierNode(variable)])
    )
  );
  return lineIndex + 1;
};

const parseImplicitVariableRounding: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];

  const match = line.match(new RegExp(`^turn (${pronouns.join("|")}) (around|round|up|down)\\W*`, "i"));
  if (!match) return lineIndex;

  const fn = parseRoundingFunctionName(match[2]);

  program.push(
    new AssignmentNode(new ImplicitIdentifierNode(), new FunctionCallNode(fn, [new ImplicitIdentifierNode()]))
  );
  return lineIndex + 1;
};

export const parseAssignment: Parser = combineParsers([
  parseVariableDeclaration,
  parseVariableAssignment,
  parseVariableIncrement,
  parseVariableDecrement,
  parseExplicitVariableRounding,
  parseImplicitVariableRounding
]);
