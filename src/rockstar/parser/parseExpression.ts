/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SimpleExpression,
  MysteriousLiteral,
  NullLiteral,
  BooleanLiteral,
  StringLiteral,
  NumberLiteral,
  ArithmeticExpression,
  NamedVariable,
  ArithmeticOperator,
  Pronoun,
  Expression,
  Literal,
  Identifier,
  FunctionCall,
  ConditionalExpression,
  LogicalNotCondition,
  Comparator,
  ComparisonCondition,
  LogicalBinaryCondition,
  LogicalOperator
} from "../ast";
import { splitOnce } from "../../utils/string-utils";

type Parsed<T> = [T | null, string];

type ExpressionParser2<T> = (input: string) => Parsed<T>;

const isParsed = <T>(parsed: Parsed<T>): boolean => parsed[0] !== null;

const anyOf = <T>(...parsers: ExpressionParser2<T>[]): ExpressionParser2<T> => (
  input: string
): Parsed<T> => {
  for (const parser of parsers) {
    const parsed = parser(input);
    if (isParsed(parsed)) return parsed;
  }
  return [null, input];
};

const exhaust = <T>(...parsers: ExpressionParser2<T>[]): ExpressionParser2<T[]> => (
  input: string
): Parsed<T[]> => {
  for (const parser of parsers) {
    const parsed = parser(input);
    if (isParsed(parsed)) {
      const innerParsed = exhaust(...parsers)(parsed[1]);
      if (isParsed(innerParsed)) {
        var f = [parsed[0] as T, ...(innerParsed[0] as T[])];
        return [f, innerParsed[1]];
      }
      return [[parsed[0] as T], innerParsed[1]];
    }
  }

  return [null, input];
};

const pipe = <T>(
  complete: (acc: any[]) => T,
  ...parsers: ExpressionParser2<any>[]
): ExpressionParser2<T> => (input: string): Parsed<T> => {
  const acc = [];
  let currInput = input;

  for (const parser of parsers) {
    const parsed = parser(currInput);
    if (!isParsed(parsed)) return [null, input];

    acc.push(parsed[0]);
    currInput = parsed[1];
  }

  return [complete(acc), currInput];
};

const anyWord = (...words: string[]): ExpressionParser2<string> => (
  input: string
): Parsed<string> => {
  const [first, rest] = splitOnce(input, " ");
  return words.includes(first) ? [first, rest] : [null, input];
};

const keyOf = <T>(obj: { [key: string]: T }): ExpressionParser2<T> => (
  input: string
): Parsed<T> => {
  for (const key of Object.keys(obj)) {
    if (input === key || input.startsWith(`${key} `)) {
      return [obj[key], input.substring(key.length).trim()];
    }
  }
  return [null, input];
};

const pronounKeywords = [
  "it",
  "he",
  "she",
  "him",
  "her",
  "they",
  "them",
  "ze",
  "hir",
  "zie",
  "zir",
  "xe",
  "xem",
  "ve",
  "ver"
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

type ArithmeticOperatorKeywords = { [key: string]: ArithmeticOperator };
const arithmeticOperatorKeywords: ArithmeticOperatorKeywords = {
  without: "subtract",
  minus: "subtract",
  of: "multiply",
  times: "multiply",
  plus: "add",
  with: "add",
  over: "divide"
};

const notKeywords = ["are not", "is not", "aint", "isnt", "not"];

type Comparators = { [key: string]: Comparator };
const comparators: Comparators = {
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
  aint: "notEquals"
};

type LogicalBinaryOperators = { [key: string]: LogicalOperator };
const logicalBinaryOperators: LogicalBinaryOperators = {
  and: "and",
  or: "or",
  nor: "nor"
};

const keywords = new Set<string>([
  "a",
  "an",
  "my",
  "your",
  "the",
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
  ...pronounKeywords,
  ...nullKeywords,
  ...mysteriousKeywords,
  ...Object.keys(booleanKeywords),
  ...Object.keys(arithmeticOperatorKeywords),
  ...Object.keys(comparators),
  ...notKeywords,
  ...Object.keys(logicalBinaryOperators)
]);

export const isPronoun = (input: string): boolean => pronounKeywords.includes(input);

const parseProperVariableName = (input: string): Parsed<Identifier> => {
  const match = input.match(/^([A-Z][a-z]+(\s[A-Z][a-z]+)+)(([.!?,\s].*)|$)/);
  if (!match) return [null, input];

  const words = match[1].split(/\s/);
  if (words.map(x => x.toLowerCase()).some(word => keywords.has(word))) return [null, input];

  return [words.join(" "), match[3].trim()];
};

const parseCommonVariableName = (input: string): Parsed<Identifier> => {
  const match = input.match(/^(a|A|an|An|my|My|your|Your|the|The)\s([a-z]+)(([.!?,\s].*)|$)/);
  if (!match) return [null, input];

  if (keywords.has(match[2].toLowerCase())) return [null, input];

  return [`${match[1]} ${match[2]}`.toLowerCase(), match[3].trim()];
};

const parseSimpleVariableName = (input: string): Parsed<Identifier> => {
  const match = input.match(/^([A-Za-z][a-z]*)(([.!?,\s].*)|$)/);
  if (!match) return [null, input];

  const name = match[1].toLowerCase();
  if (keywords.has(name)) return [null, input];

  return [name, match[2].trim()];
};

const identifierParsers = [
  parseProperVariableName,
  parseCommonVariableName,
  parseSimpleVariableName
];

export const parseIdentifier2 = anyOf(...identifierParsers);

export const parseIdentifier = (input: string): Identifier | null => {
  const [identifier, unparsed] = parseIdentifier2(input);
  return identifier && unparsed === "" ? identifier : null;
};

export const parseNamedVariable2 = (input: string): Parsed<NamedVariable> => {
  const parsed = parseIdentifier2(input);
  if (!isParsed(parsed)) return [null, input];

  const variable: NamedVariable = {
    type: "variable",
    name: parsed[0] as string
  };
  return [variable, parsed[1]];
};

export const parseNamedVariable = (input: string): NamedVariable | null => {
  const name = parseIdentifier(input);
  if (!name) return null;

  return {
    type: "variable",
    name
  };
};

export const parsePronoun2 = (input: string): Parsed<Pronoun> => {
  const [first, rest] = splitOnce(input, " ");
  if (!isPronoun(first)) return [null, input];

  const pronoun: Pronoun = {
    type: "pronoun"
  };
  return [pronoun, rest];
};

export const parsePronoun = (input: string): Pronoun | null => {
  if (!isPronoun(input.toLowerCase())) return null;

  return {
    type: "pronoun"
  };
};

export const parseMysteriousLiteral2 = (input: string): Parsed<MysteriousLiteral> => {
  const [first, rest] = splitOnce(input, " ");
  const isMysterious = mysteriousKeywords.includes(first);
  if (!isMysterious) return [null, input];

  const mysterious: MysteriousLiteral = {
    type: "mysterious"
  };
  return [mysterious, rest];
};

export const parseMysteriousLiteral = (input: string): MysteriousLiteral | null => {
  const isMysterious = mysteriousKeywords.includes(input.toLowerCase());
  if (!isMysterious) return null;

  return {
    type: "mysterious"
  };
};

export const parseNullLiteral2 = (input: string): Parsed<NullLiteral> => {
  const [first, rest] = splitOnce(input, " ");
  const isNull = nullKeywords.includes(first);
  if (!isNull) return [null, input];

  const nullLiteral: NullLiteral = {
    type: "null"
  };
  return [nullLiteral, rest];
};

export const parseNullLiteral = (input: string): NullLiteral | null => {
  const isNull = nullKeywords.includes(input.toLowerCase());
  if (!isNull) return null;

  return {
    type: "null"
  };
};

export const parseBooleanLiteral2 = (input: string): Parsed<BooleanLiteral> => {
  const [first, rest] = splitOnce(input, " ");
  const isBoolean = first in booleanKeywords;
  if (!isBoolean) return [null, input];

  const booleanLiteral: BooleanLiteral = {
    type: "boolean",
    value: booleanKeywords[first]
  };
  return [booleanLiteral, rest];
};

export const parseBooleanLiteral = (input: string): BooleanLiteral | null => {
  const isBoolean = input.toLowerCase() in booleanKeywords;
  if (!isBoolean) return null;

  return {
    type: "boolean",
    value: booleanKeywords[input.toLowerCase()]
  };
};

export const parsePoeticStringLiteral = (input: string): StringLiteral | null => ({
  type: "string",
  value: input
});

export const parseStringLiteral2 = (input: string): Parsed<StringLiteral> => {
  const match = input.match(/^"([^"]*)"((\s+.+)|$)/);
  if (!match) return [null, input];

  const stringLiteral: StringLiteral = {
    type: "string",
    value: match[1]
  };
  return [stringLiteral, match[2].trim()];
};

export const parseStringLiteral = (input: string): StringLiteral | null => {
  const isStringLiteral = input.length > 1 && input[0] === '"' && input[input.length - 1] === '"';
  if (!isStringLiteral) return null;

  return {
    type: "string",
    value: input.substring(1, input.length - 1)
  };
};

export const parsePoeticNumberLiteral = (input: string): NumberLiteral | null => {
  // replace all dot occurrences, but the first one
  input = input.replace(/\./g, (match, offset, all) => (all.indexOf(".") === offset ? " . " : ""));

  // ignore all non-alphabetical characters
  input = input.replace(/[^A-Za-z0-9\s.-]/g, "");

  const module = (w: string): number => w.length % 10;
  const value = parseFloat(
    input.split(/\s+/).reduce((result, word) => `${result}${word === "." ? "." : module(word)}`, "")
  );
  return {
    type: "number",
    value
  };
};

export const parseNumberLiteral2 = (input: string): Parsed<NumberLiteral> => {
  const match = input.match(/^(\d+(\.\d+)?)((\s+.+)|$)/);
  if (!match) return [null, input];

  const value = parseFloat(match[1]);
  if (isNaN(value)) return [null, input];

  const numberLiteral: NumberLiteral = {
    type: "number",
    value
  };
  return [numberLiteral, match[3].trim()];
};

export const parseNumberLiteral = (input: string): NumberLiteral | null => {
  const value = parseFloat(input);
  const isNumberLiteral = !isNaN(value);
  if (!isNumberLiteral) return null;

  return {
    type: "number",
    value
  };
};

export const parseLiteral2 = anyOf<Literal>(
  parseMysteriousLiteral2,
  parseNullLiteral2,
  parseStringLiteral2,
  parseBooleanLiteral2,
  parseNumberLiteral2
);

const literalParsers = [
  parseMysteriousLiteral,
  parseNullLiteral,
  parseStringLiteral,
  parseBooleanLiteral,
  parseNumberLiteral
];

export const parseLiteral = (input: string): Literal | null =>
  literalParsers.reduce<Literal | null>((node, parser) => node || parser(input), null);

export const parseSimpleExpression2 = anyOf<SimpleExpression>(
  parseLiteral2,
  parsePronoun2,
  parseNamedVariable2
);

const simpleExpressionParsers = [parseLiteral, parsePronoun, parseNamedVariable];

export const parseSimpleExpression = (input: string): SimpleExpression | null =>
  simpleExpressionParsers.reduce<SimpleExpression | null>(
    (node, parser) => node || parser(input),
    null
  );

export const parseArithmeticExpression2 = pipe<ArithmeticExpression>(
  (acc: any[]) => ({
    type: "arithmeticExpression",
    left: acc[0],
    operator: acc[1],
    right: acc[2]
  }),
  parseSimpleExpression2,
  keyOf(arithmeticOperatorKeywords),
  parseSimpleExpression2
);

const arithmeticExpressionParser = (pattern: RegExp, operator: ArithmeticOperator) => (
  input: string
): ArithmeticExpression | null => {
  const match = input.match(pattern);
  if (!match) return null;

  const left = parseNamedVariable(match[1]);
  const right = parseSimpleExpression(match[3]);
  if (!left || !right) return null;

  return {
    type: "arithmeticExpression",
    operator,
    left,
    right
  };
};

const arithmeticExpressionParsers = [
  arithmeticExpressionParser(/^(.+?) (without|minus) (.+)$/i, "subtract"),
  arithmeticExpressionParser(/^(.+?) (of|times) (.+)$/i, "multiply"),
  arithmeticExpressionParser(/^(.+?) (over) (.+)$/i, "divide"),
  arithmeticExpressionParser(/^(.+?) (plus|with) (.+)$/i, "add")
];

export const parseArithmeticExpression = (input: string): ArithmeticExpression | null =>
  arithmeticExpressionParsers.reduce<ArithmeticExpression | null>(
    (node, parser) => node || parser(input),
    null
  );

const greedy = <T>(parser: ExpressionParser2<T>): ExpressionParser2<T[]> => (
  input: string
): Parsed<T[]> => {
  const result: T[] = [];
  let currInput = input;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const parsed = parser(currInput);
    if (!isParsed(parsed)) break;

    currInput = parsed[1];
    result.push(parsed[0] as T);
  }

  return [result, currInput];
};

export const parseFunctionCall2 = pipe<FunctionCall>(
  (acc: any[]) => ({
    type: "call",
    name: acc[0],
    args: [acc[2], ...acc[3]]
  }),
  parseIdentifier2,
  anyWord("taking"),
  parseSimpleExpression2,
  greedy(
    pipe<SimpleExpression>(
      (acc: any[]) => acc[1],
      anyWord(", and", "and", ",", "&", "'n'"),
      parseSimpleExpression2
    )
  )
);

export const parseFunctionCall = (input: string): FunctionCall | null => {
  const match = input.match(
    /^([a-zA-Z\s]+?) taking (["a-zA-Z0-9\s]+?)(((,|and|'n') ([a-zA-Z0-9\s]+?))*)$/i
  );
  if (!match) return null;

  const name = parseIdentifier(match[1]);
  if (!name) return null;

  const firstArg = parseSimpleExpression(match[2]);
  if (!firstArg) return null;

  const args = [firstArg];

  // other args
  if (match[3]) {
    const otherArgs = match[3]
      .split(/,|and|'n'/g)
      .filter(x => x !== "")
      .map(x => parseSimpleExpression(x.trim()));
    if (otherArgs.some(x => !x)) return null;

    args.push(...(otherArgs as SimpleExpression[]));
  }

  return {
    type: "call",
    name,
    args
  };
};

const parseAnyButConditionExpression2 = anyOf<Expression>(
  parseFunctionCall2,
  parseArithmeticExpression2,
  parseSimpleExpression2
);

const parseLogicalNotCondition2 = pipe<LogicalNotCondition>(
  (acc: any[]) => ({
    type: "logicalNotCondition",
    right: acc[1]
  }),
  anyWord(...notKeywords),
  parseAnyButConditionExpression2
);

const parseLogicalBinaryCondition2 = pipe<LogicalBinaryCondition>(
  (acc: any[]) => ({
    type: "logicalBinaryCondition",
    left: acc[0],
    operator: acc[1],
    right: acc[2]
  }),
  parseAnyButConditionExpression2,
  keyOf(logicalBinaryOperators),
  parseAnyButConditionExpression2
);

const parseComparisonCondition2 = pipe<ComparisonCondition>(
  (acc: any[]) => ({
    type: "comparisonCondition",
    left: acc[0],
    operator: acc[1],
    right: acc[2]
  }),
  parseAnyButConditionExpression2,
  keyOf(comparators),
  parseAnyButConditionExpression2
);

export const parseCondition2 = anyOf<ConditionalExpression>(
  parseLogicalNotCondition2,
  parseComparisonCondition2
);

const a = [
  parseFunctionCall2,
  parseLogicalNotCondition2,
  parseArithmeticExpression2, // multiply / divide, add / subtract
  parseComparisonCondition2,
  parseLogicalBinaryCondition2
];
export const parseExpression2 = exhaust<Expression>(...a);

export const parseExpression = (input: string): Expression | null =>
  parseFunctionCall(input) || parseArithmeticExpression(input) || parseSimpleExpression(input);
