import { Parser } from "./types";
import { Scope } from "../ast";

export const combineParsers = (parsers: Parser[]): Parser => (
  scope: Scope,
  lines: string[],
  lineIndex: number
): number => {
  for (const parser of parsers) {
    const nextLineIndex = parser(scope, lines, lineIndex);
    if (nextLineIndex > lineIndex) {
      return nextLineIndex;
    }
  }
  return lineIndex;
};
