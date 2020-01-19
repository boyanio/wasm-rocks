import { Program, Statement } from "../ast";
import { Context, ParseError } from "./types";
import { statement, functionDeclaration } from "./statements/functionDeclarations";
import { anyOf, map, isParseError, oneOrMany } from "./parsers";

const program = map(
  (statements: Statement[]) => ({ type: "program", statements }),
  oneOrMany(anyOf<Statement>(functionDeclaration, statement))
);

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

  return result as Program;
};
