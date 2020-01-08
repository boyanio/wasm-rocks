import { Program, Parser } from "./types";
import { parseComment } from "./parseComment";
import { parseAssignment } from "./parseAssignment";
import { combineParsers } from "./combineParsers";
import { parseIO } from "./parseIO";
import { parseInPlaceMutation } from "./parseInPlaceMutation";
import { parseVariableDeclaration } from "./parseVariableDeclaration";

const parser: Parser = combineParsers([
  parseComment,
  parseAssignment,
  parseVariableDeclaration,
  parseInPlaceMutation,
  parseIO
]);

const parseLines = (program: Program, lines: string[]): void => {
  let lineIndex = 0;

  do {
    const nextLineIndex = parser(program, lines, lineIndex);
    if (nextLineIndex !== lineIndex + 1) throw new Error(`Parse error at line ${lineIndex}`);

    lineIndex = nextLineIndex;
  } while (lineIndex < lines.length);
};

const formatSingleQuotes = (input: string): string =>
  input.replace(/'s\W+/g, " is ").replace("'", "");

export function parse(input: string): Program {
  const program: Program = [];
  const lines = formatSingleQuotes(input.trim())
    .split(/\r?\n/)
    .map(x => x.trim());
  parseLines(program, lines);
  return program;
}
