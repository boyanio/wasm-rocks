import { Program, Parser, VariableDeclaration } from "./types";
import {
  parsePoeticNumberLiteral,
  parsePoeticStringLiteral,
  parseVariable,
  parseLiteral
} from "./parseExpression";

const parseWithPoeticString = (line: string): VariableDeclaration | null => {
  const match = line.match(/^(.+?)\s+says\s+(.+)/i);
  if (!match) return null;

  const variable = parseVariable(match[1]);
  if (!variable) return null;

  const value = parsePoeticStringLiteral(match[2]);
  if (!value) return null;

  return new VariableDeclaration(variable, value);
};

const parseWithNonStringPoeticLiteral = (line: string): VariableDeclaration | null => {
  const match = line.match(/^(.+?)\s+(is|are|was|were)\s+(.+)/i);
  if (!match) return null;

  const variable = parseVariable(match[1]);
  if (!variable) return null;

  const value = parseLiteral(match[3]) || parsePoeticNumberLiteral(match[3]);
  if (!value) return null;

  return new VariableDeclaration(variable, value);
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
