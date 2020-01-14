import { Program } from "../ast";
import { combineParsers } from "./combineParsers";
import { Parser } from "./types";
import { parseStatements, parseFunctionDeclaration } from "./parseFunctionDeclarations";

const parser: Parser = combineParsers([parseFunctionDeclaration, parseStatements]);

const parseLines = (program: Program, lines: string[]): void => {
  let lineIndex = 0;

  do {
    const nextLineIndex = parser(program, lines, lineIndex);
    if (nextLineIndex <= lineIndex) throw new Error(`Parse error at line ${lineIndex}`);

    lineIndex = nextLineIndex;
  } while (lineIndex < lines.length);
};

const formatSingleQuotes = (input: string): string =>
  input.replace(/'s\W+/g, " is ").replace("'", "");

export function parse(input: string): Program {
  const program: Program = {
    type: "program",
    statements: []
  };
  const lines = formatSingleQuotes(input.trim())
    .split(/\r?\n/)
    .map(x => x.trim());
  parseLines(program, lines);
  return program;
}
