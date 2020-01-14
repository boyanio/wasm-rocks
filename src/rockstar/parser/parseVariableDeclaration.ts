import { Parser } from "./types";
import { Program, VariableDeclaration } from "../ast";
import {
  parsePoeticNumberLiteral,
  parsePoeticStringLiteral,
  parseNamedVariable,
  parseLiteral
} from "./parseExpression";

const parseWithPoeticString = (line: string): VariableDeclaration | null => {
  const match = line.match(/^(.+?)\s+says\s+(.+)/i);
  if (!match) return null;

  const variable = parseNamedVariable(match[1]);
  if (!variable) return null;

  const value = parsePoeticStringLiteral(match[2]);
  if (!value) return null;

  const variableDeclaration: VariableDeclaration = {
    type: "variableDeclaration",
    variable,
    value
  };
  return variableDeclaration;
};

const parseWithNonStringPoeticLiteral = (line: string): VariableDeclaration | null => {
  const match = line.match(/^(.+?)\s+(is|are|was|were)\s+(.+)/i);
  if (!match) return null;

  const variable = parseNamedVariable(match[1]);
  if (!variable) return null;

  const value = parseLiteral(match[3]) || parsePoeticNumberLiteral(match[3]);
  if (!value) return null;

  const variableDeclaration: VariableDeclaration = {
    type: "variableDeclaration",
    variable,
    value
  };
  return variableDeclaration;
};

export const parseVariableDeclaration: Parser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];

  const node = parseWithPoeticString(line) || parseWithNonStringPoeticLiteral(line);
  if (!node) return lineIndex;

  program.push(node);
  return lineIndex + 1;
};
