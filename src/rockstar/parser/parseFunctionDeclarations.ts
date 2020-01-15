import { Parser } from "./types";
import { Scope, FunctionDeclaration, NamedVariable } from "../ast";
import { parseNamedVariable, parseSimpleExpression, parseIdentifier } from "./parseExpression";
import { combineParsers } from "./combineParsers";
import { parseComment } from "./parseComment";
import { parseAssignment } from "./parseAssignment";
import { parseVariableDeclaration } from "./parseVariableDeclaration";
import { parseIncrementDecrement } from "./parseIncrementDecrement";
import { parseArithmeticRounding } from "./parseArithmeticRounding";
import { parseIO } from "./parseIO";

export const parseStatements = combineParsers([
  parseComment,
  parseAssignment,
  parseVariableDeclaration,
  parseIncrementDecrement,
  parseArithmeticRounding,
  parseIO
]);

/**
 * Parses a function
 *
 *    <name> takes <arg0>( and|&|'n' <arg1>)*
 *
 * @param scope
 * @param lines
 * @param lineIndex
 */
export const parseFunctionDeclaration: Parser = (
  scope: Scope,
  lines: string[],
  lineIndex: number
): number => {
  const startLine = lines[lineIndex];

  const startLineMatch = startLine.match(
    /^([a-zA-Z\s]+?) takes ([a-zA-Z\s]+?)( (and|&|'n') ([a-zA-Z\s]+?))?$/i
  );
  if (!startLineMatch) return lineIndex;

  const name = parseIdentifier(startLineMatch[1]);
  if (!name) return lineIndex;

  const parsedArgs = [startLineMatch[2], startLineMatch[5]]
    .filter(x => !!x)
    .map(x => parseNamedVariable(x.trim()))
    .filter(x => !!x);
  if (!parsedArgs.length) return lineIndex;

  const func: FunctionDeclaration = {
    type: "function",
    name,
    args: parsedArgs as NamedVariable[],
    result: { type: "pronoun" }, // this will be overriden at the end
    statements: []
  };

  let currentLineIndex: number = lineIndex + 1;
  let nextLineIndex: number;
  while ((nextLineIndex = parseStatements(func, lines, currentLineIndex)) > currentLineIndex) {
    currentLineIndex = nextLineIndex;
  }

  while (lines[currentLineIndex].trim() === "") {
    currentLineIndex++;
  }

  const returnLine = lines[currentLineIndex];
  const returnLineMatch = returnLine.match(/^Give back ([a-zA-Z\s]+)$/i);
  if (!returnLineMatch) return currentLineIndex;

  const result = parseSimpleExpression(returnLineMatch[1]);
  if (!result) return currentLineIndex;

  func.result = result;
  scope.statements.push(func);
  return currentLineIndex + 1;
};
