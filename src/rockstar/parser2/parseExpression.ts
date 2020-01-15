import {
  SimpleExpression,
  MysteriousLiteral,
  NullLiteral,
  BooleanLiteral,
  StringLiteral,
  NumberLiteral,
  NamedVariable,
  Pronoun,
  Expression,
  Literal,
  Identifier,
  FunctionCall,
  BinaryOperator,
  UnaryOperator,
  Operator
} from "../ast";
import { Context, Parser, Parsed } from "./types";
import {
  anyWord,
  drop,
  pattern,
  map,
  sequence,
  anyOf,
  batch,
  end,
  keysOf,
  between,
  whitespace,
  zeroOrMany,
  $1,
  $2
} from "./parsers";
import { createOperatorPrecedenceTree } from "./operatorPrecedence";

const pronounKeywords = [
  "they",
  "them",
  "him",
  "her",
  "xem",
  "she",
  "hir",
  "zie",
  "zir",
  "ver",
  "it",
  "he",
  "ze",
  "xe",
  "ve"
];

const nullKeywords = ["null", "nowhere", "nothing", "nobody", "gone", "empty"];

const mysteriousKeywords = ["mysterious"];

type BooleanKeywords = { [key: string]: boolean };
const booleanKeywords: BooleanKeywords = {
  true: true,
  right: true,
  yes: true,
  ok: true,
  false: false,
  no: false,
  lies: false,
  wrong: false
};

type BinaryOperators = { [key: string]: BinaryOperator };
const binaryOperators: BinaryOperators = {
  "is higher than": "greaterThan",
  "is greater than": "greaterThan",
  "is bigger than": "greaterThan",
  "is stronger than": "greaterThan",
  "is as high as": "greaterThanOrEquals",
  "is as great as": "greaterThanOrEquals",
  "is as big as": "greaterThanOrEquals",
  "is as strong as": "greaterThanOrEquals",
  "is lower than": "lowerThan",
  "is less than": "lowerThan",
  "is smaller than": "lowerThan",
  "is weaker than": "lowerThan",
  "is as low as": "lowerThanOrEquals",
  "is as little as": "lowerThanOrEquals",
  "is as small as": "lowerThanOrEquals",
  "is as weak as": "lowerThanOrEquals",
  "is not": "notEquals",
  "are not": "notEquals",
  is: "equals",
  are: "equals",
  isnt: "notEquals",
  aint: "notEquals",
  and: "and",
  or: "or",
  nor: "nor",
  without: "subtract",
  minus: "subtract",
  of: "multiply",
  times: "multiply",
  plus: "add",
  with: "add",
  over: "divide"
};

type UnaryOperators = { [key: string]: UnaryOperator };
const unaryOperators: UnaryOperators = {
  not: "not"
};

const commonVariableNamePrefixes = ["a", "A", "an", "An", "my", "My", "your", "Your", "the", "The"];

const keywords = new Set<string>([
  "maybe",
  "definitely maybe",
  "if",
  "while",
  "and",
  "or",
  "is",
  "isnt",
  "are",
  "arent",
  "let",
  "put",
  "be",
  "into",
  "takes",
  "taking",
  ...commonVariableNamePrefixes,
  ...pronounKeywords,
  ...nullKeywords,
  ...mysteriousKeywords,
  ...Object.keys(booleanKeywords),
  ...Object.keys(binaryOperators)
]);

const nonAlphaSymbolOrEnd = drop(anyOf(whitespace(), pattern("[,.!?]+", false), end));

const properVariableName: Parser<Identifier> = map((result: string, toParseError) => {
  const containsKeyword = result
    .split(/\s/)
    .map(x => x.toLowerCase())
    .some(x => keywords.has(x));
  return containsKeyword ? toParseError("Variable proper name cannot contain keywords") : result;
}, batch($1, pattern("[A-Z][a-z]+(\\s[A-Z][a-z]+)+"), nonAlphaSymbolOrEnd));

const commonVariableName: Parser<Identifier> = map(
  ([first, second]: string[], toParseError) =>
    keywords.has(second)
      ? toParseError("Common variables cannot contain keywords")
      : `${first.toLowerCase()} ${second}`,
  batch(
    (first, second) => [first, second],
    anyWord(...commonVariableNamePrefixes),
    pattern("[a-z]+"),
    nonAlphaSymbolOrEnd
  )
);

const simpleVariableName: Parser<Identifier> = map(
  (result: string, toParseError) =>
    keywords.has(result.toLowerCase())
      ? toParseError("Simple variables cannot be keywords")
      : result.toLowerCase(),
  batch($1, pattern("[A-Za-z][a-z]*"), nonAlphaSymbolOrEnd)
);

export const identifier = anyOf(properVariableName, commonVariableName, simpleVariableName);

export const namedVariable: Parser<NamedVariable> = map(
  (name: string) => ({ type: "variable", name }),
  identifier
);

export const pronoun: Parser<Pronoun> = map(
  () => ({ type: "pronoun" }),
  batch($1, anyWord(...pronounKeywords), nonAlphaSymbolOrEnd)
);

export const mysteriousLiteral: Parser<MysteriousLiteral> = map(
  () => ({ type: "mysterious" }),
  batch($1, anyWord(...mysteriousKeywords), nonAlphaSymbolOrEnd)
);

export const nullLiteral: Parser<NullLiteral> = map(
  () => ({ type: "null" }),
  batch($1, anyWord(...nullKeywords), nonAlphaSymbolOrEnd)
);

export const booleanLiteral: Parser<BooleanLiteral> = map(
  (value: boolean) => ({ type: "boolean", value }),
  batch($1, keysOf(booleanKeywords), nonAlphaSymbolOrEnd)
);

// TODO?
// export const parsePoeticStringLiteral = (input: string): StringLiteral | null => ({
//   type: "string",
//   value: input
// });

export const stringLiteral: Parser<StringLiteral> = map(
  (value: string) => ({ type: "string", value }),
  batch($1, between('"', '"'), nonAlphaSymbolOrEnd)
);

export const poeticNumberLiteral: Parser<NumberLiteral> = (
  source: string,
  context: Context
): Parsed<NumberLiteral> => {
  // replace all dot occurrences, but the first one
  source = source.replace(/\./g, (match, offset, all) =>
    all.indexOf(".") === offset ? " . " : ""
  );

  // ignore all non-alphabetical characters
  source = source.replace(/[^A-Za-z0-9\s.-]/g, "");

  const module = (w: string): number => w.length % 10;
  const value = parseFloat(
    source
      .split(/\s+/)
      .reduce((result, word) => `${result}${word === "." ? "." : module(word)}`, "")
  );

  context.offset = source.length;
  return { type: "number", value };
};

export const numberLiteral: Parser<NumberLiteral> = map((value: string, toParserError) => {
  const num = parseFloat(value);
  return isNaN(num) ? toParserError("Invalid number parsed") : { type: "number", value: num };
}, batch($1, pattern("\\d+(.\\d+)?"), nonAlphaSymbolOrEnd));

export const literal = anyOf<Literal>(
  mysteriousLiteral,
  nullLiteral,
  booleanLiteral,
  numberLiteral,
  stringLiteral
);

export const simpleExpression = anyOf<SimpleExpression>(namedVariable, literal, pronoun);

export const functionCall: Parser<FunctionCall> = sequence(
  (name, _, firstArg, otherArgs) => ({
    type: "call",
    name,
    args: [firstArg, ...otherArgs]
  }),
  identifier,
  anyWord("taking"),
  simpleExpression,
  zeroOrMany(sequence($2, anyWord(", and", "and", ",", "&", "'n'"), simpleExpression))
);

export const expression = ((): Parser<Expression> => {
  const operand = anyOf<Expression>(functionCall, simpleExpression);

  const binaryOperator: Parser<BinaryOperator> = map(
    x => x as BinaryOperator,
    anyWord(...Object.keys(binaryOperators))
  );

  const unaryOperator: Parser<UnaryOperator> = map(
    x => x as UnaryOperator,
    anyWord(...Object.keys(unaryOperators))
  );

  return map(
    (arr: (Operator | Expression)[]) => createOperatorPrecedenceTree(arr),
    zeroOrMany(anyOf<Operator | Expression>(binaryOperator, unaryOperator, operand))
  );
})();
