import { Program, Statement } from "../ast";
import { Context, ParseError } from "./types";
import { statement, functionDeclaration } from "./statements/functionDeclarations";
import { anyOf, map, isParseError, oneOrMany, emptyLine, toNextLine } from "./parsers";

const program = map(
  (statements: (Statement | null)[]) =>
    ({
      type: "program",
      statements: statements.filter(x => x)
    } as Program),
  oneOrMany(anyOf<Statement | null>(functionDeclaration, statement, toNextLine(emptyLine)))
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

  // add a fake line at the end so that parsing can always
  // end with an empty line
  lines.push("");

  const context: Context = {
    lineIndex: 0,
    offset: 0
  };
  const result = program(lines, context);
  if (isParseError(result)) throw createParseError(result as ParseError);

  if (lines.length > 0 && context.lineIndex !== lines.length)
    throw new Error(`Parsing ended on line ${context.lineIndex} (of ${lines.length - 1} lines)`);

  return result as Program;
};
