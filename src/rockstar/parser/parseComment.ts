import { Parser, Program, CommentNode } from "./types";

export const parseComment: Parser = (program: Program, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];
  const isComment = line.charAt(0) === "(" && line.charAt(line.length - 1) === ")";
  if (isComment) {
    program.push(new CommentNode(line.substring(1, line.length - 1)));
    return lineIndex + 1;
  }
  return lineIndex;
};
