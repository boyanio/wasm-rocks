import { Program } from "../ast";
import { Context, ParseError } from "./types";
import { isParseError } from "./parsers";
import { program } from "./program";

const createParseError = (error: ParseError): Error =>
  new Error(`Parse error at line ${error.lineIndex + 1}, offset ${error.offset}: ${error.message}`);

export const parse = (source: string): Program => {
  const lines = source
    .trim()
    .replace(/'s\W+/g, " is ")
    .replace("'", "")
    .split(/\r?\n/)
    .map(x => x.trim());

  const context: Context = {
    lineIndex: 0,
    offset: 0
  };
  const result = program(lines, context);
  if (isParseError(result)) throw createParseError(result as ParseError);

  if (lines.length > 0 && context.lineIndex !== lines.length - 1)
    throw new Error(
      `Parsing ended on line ${context.lineIndex + 1}, but there are ${lines.length} lines`
    );

  return result as Program;
};
