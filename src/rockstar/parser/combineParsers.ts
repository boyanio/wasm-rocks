import { Parser, Program } from "./types";

export const combineParsers = (parsers: Parser[]): Parser => (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  for (const parser of parsers) {
    const nextLineIndex = parser(program, lines, lineIndex);
    if (nextLineIndex > lineIndex) {
      return nextLineIndex;
    }
  }
  return lineIndex;
};
