import { Parser } from "./types";
import { Program, Comment, Scope } from "../ast";

/**
 * Parses a comment
 *
 *    (<anystring>)
 */
export const parseComment: Parser = (scope: Scope, lines: string[], lineIndex: number): number => {
  const line = lines[lineIndex];
  const isComment = line.charAt(0) === "(" && line.charAt(line.length - 1) === ")";
  if (!isComment) return lineIndex;

  const comment: Comment = {
    type: "comment",
    comment: line.substring(1, line.length - 1)
  };
  scope.statements.push(comment);
  return lineIndex + 1;
};
