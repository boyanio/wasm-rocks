import {
  SimpleExpression,
  MysteriousLiteral,
  NullLiteral,
  BooleanLiteral,
  StringLiteral,
  NumberLiteral,
  Variable,
  Pronoun,
  Expression,
  Literal,
  Identifier,
  FunctionCallExpression,
  Operator
} from "../../ast";
import { Parser } from "../types";
import {
  anyWord,
  pattern,
  map,
  sequence,
  anyOf,
  batch,
  keysOf,
  between,
  zeroOrMany,
  $1,
  $2,
  word,
  punctuation,
  optional
} from "../parsers";
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

type Operators = { [key: string]: Operator };
const operators: Operators = {
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
  xor: "xor",
  without: "subtract",
  minus: "subtract",
  of: "multiply",
  times: "multiply",
  plus: "add",
  with: "add",
  over: "divide",
  not: "not"
};

const commonVariableNamePrefixes = ["a", "A", "an", "An", "my", "My", "your", "Your", "the", "The"];

const keywords = new Set<string>([
  "maybe",
  "definitely",
  "if",
  "else",
  "while",
  "until",
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
  "build",
  "up",
  "knock",
  "down",
  "shout",
  "say",
  "whisper",
  "scream",
  "listen",
  "turn",
  "round",
  "around",
  "give",
  "back",
  "break",
  "continue",
  "take",
  ...commonVariableNamePrefixes,
  ...pronounKeywords,
  ...nullKeywords,
  ...mysteriousKeywords,
  ...Object.keys(booleanKeywords),
  ...Object.keys(operators)
]);

const properVariableName: Parser<Identifier> = map((result: string, toParseError) => {
  const containsKeyword = result
    .toLowerCase()
    .split(/\s/)
    .some(x => keywords.has(x));
  return containsKeyword ? toParseError("Proper variables cannot contain keywords") : result;
}, batch($1, pattern("[A-Z][a-z]+(\\s[A-Z][a-z]+)+"), punctuation));

const commonVariableName: Parser<Identifier> = map(
  ([first, second]: string[], toParseError) =>
    keywords.has(second)
      ? toParseError("Common variables cannot contain keywords")
      : `${first.toLowerCase()} ${second}`,
  batch(
    (first, second) => [first, second],
    anyWord(...commonVariableNamePrefixes),
    pattern("[a-z]+"),
    punctuation
  )
);

const simpleVariableName: Parser<Identifier> = map(
  (result: string, toParseError) =>
    keywords.has(result.toLowerCase())
      ? toParseError("Simple variables cannot be keywords")
      : result.toLowerCase(),
  batch($1, pattern("[A-Za-z][a-z]*"), punctuation)
);

export const identifier = anyOf(properVariableName, commonVariableName, simpleVariableName);

export const variable: Parser<Variable> = map(
  (name: string) => ({ type: "variable", name }),
  identifier
);

export const pronoun: Parser<Pronoun> = map(
  () => ({ type: "pronoun" }),
  anyWord(...pronounKeywords)
);

export const mysteriousLiteral: Parser<MysteriousLiteral> = map(
  () => ({ type: "mysterious" }),
  anyWord(...mysteriousKeywords)
);

export const nullLiteral: Parser<NullLiteral> = map(
  () => ({ type: "null" }),
  anyWord(...nullKeywords)
);

export const booleanLiteral: Parser<BooleanLiteral> = map(
  (value: boolean) => ({ type: "boolean", value }),
  keysOf(booleanKeywords)
);

export const stringLiteral: Parser<StringLiteral> = map(
  (value: string) => ({ type: "string", value }),
  batch($1, between('"', '"'), punctuation)
);

export const numberLiteral: Parser<NumberLiteral> = map((value: string, toParserError) => {
  const num = parseFloat(value);
  return isNaN(num) ? toParserError("Invalid number parsed") : { type: "number", value: num };
}, batch($1, pattern("\\d+(.\\d+)?"), punctuation));

export const literal = anyOf<Literal>(
  mysteriousLiteral,
  nullLiteral,
  booleanLiteral,
  numberLiteral,
  stringLiteral
);

export const simpleExpression = anyOf<SimpleExpression>(variable, literal, pronoun);

export const functionCall: Parser<FunctionCallExpression> = sequence(
  (name, firstArg, otherArgs) => ({
    type: "functionCall",
    name,
    args: [firstArg, ...otherArgs]
  }),
  batch($1, identifier, word("taking")),
  simpleExpression,
  zeroOrMany(sequence($2, optional(anyWord("and", "&", "'n'")), simpleExpression))
);

export const expression = map(
  (arr: (Operator | Expression)[], toParseError) => createOperatorPrecedenceTree(arr, toParseError),
  zeroOrMany(anyOf<Operator | Expression>(keysOf(operators), functionCall, simpleExpression))
);
