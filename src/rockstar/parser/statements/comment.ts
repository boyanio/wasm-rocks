import { Parser } from "../types";
import { Comment } from "../../ast";
import { between, map, nextLineOrEOF } from "../parsers";

/**
 * Parses a comment
 *
 *    (<anystring>)
 */
export const comment: Parser<Comment> = nextLineOrEOF(
  map(str => ({ type: "comment", comment: str }), between("(", ")"))
);
