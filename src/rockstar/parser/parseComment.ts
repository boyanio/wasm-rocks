import { Parser, Program, Comment } from "./types";

/**
 * Parses a comment
 *
 *    (<anystring>)
 *
 * @param program
 * @param lines
 * @param lineIndex
 */
export const parseComment: Parser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];
  const isComment = line.charAt(0) === "(" && line.charAt(line.length - 1) === ")";
  if (isComment) {
    program.push(new Comment(line.substring(1, line.length - 1)));
    return lineIndex + 1;
  }
  return lineIndex;
};
