import { Program, Assignment, Parser } from "./types";
import { parseExpression, parseVariable } from "./parseExpression";

const parseIdentifierAssignment = (
  identifierString: string,
  expressionString: string
): Assignment | null => {
  const variable = parseVariable(identifierString);
  if (!variable) return null;

  const expression = parseExpression(expressionString);
  if (!expression) return null;

  return new Assignment(variable, expression);
};

const parsePutAssignment = (line: string): Assignment | null => {
  const match = line.match(/^put (.+?) into (.+)$/i);
  return match ? parseIdentifierAssignment(match[2], match[1]) : null;
};

const parseLetAssignment = (line: string): Assignment | null => {
  const match = line.match(/^let (.+?) be (.+)$/i);
  return match ? parseIdentifierAssignment(match[1], match[2]) : null;
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
