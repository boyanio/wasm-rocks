import { Parser } from "../types";
import { Comment } from "../../ast";
import { between, map } from "../parsers";

/**
 * Parses a comment
 *
 *    (<anystring>)
 */
export const comment: Parser<Comment> = map(
  str => ({ type: "comment", comment: str }),
  between("(", ")")
);
