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
  FunctionCall
} from "../ast";
import { capitalize } from "../../utils/string-utils";

const pronouns = [
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

const nullWords = ["null", "nowhere", "nothing", "nobody", "gone", "empty"];

const mysteriousWords = ["mysterious"];

type BooleanWords = { [key: string]: boolean };
const booleanWords: BooleanWords = {
  true: true,
  right: true,
  yes: true,
  ok: true,
  false: false,
  no: false,
  lies: false,
  wrong: false
};

const keywords = [
  "maybe",
  "definitely maybe",
  ...pronouns,
  ...nullWords,
  ...mysteriousWords,
  ...Object.keys(booleanWords)
];

export const isPronoun = (input: string): boolean => pronouns.includes(input.toLowerCase());

export const parseIdentifier = (input: string): Identifier | null => {
  const parseProperVariableName = (): string | null => {
    if (!/^([A-Z][a-zA-Z]+\s){2,}$/.test(`${input} `)) return null;
    return input // transform to Xxxx Yyyy
      .split(/\s+/)
      .map(capitalize)
      .join(" ");
  };

  const parseCommonVariableName = (): string | null => {
    if (!/^(a|an|my|your|the)\s+[a-zA-Z]+$/i.test(input)) return null;
    return input.toLowerCase();
  };

  const parseSimpleVariableName = (): string | null => {
    if (!/^[a-zA-Z]+$/.test(input)) return null;
    return input.toLowerCase();
  };

  const name = parseProperVariableName() || parseCommonVariableName() || parseSimpleVariableName();
  if (!name || keywords.includes(name)) return null;

  return name;
};

export const parseNamedVariable = (input: string): NamedVariable | null => {
  const name = parseIdentifier(input);
  if (!name) return null;

  return {
    type: "variable",
    name
  };
};

export const parsePronoun = (input: string): Pronoun | null => {
  if (!isPronoun(input.toLowerCase())) return null;

  return {
    type: "pronoun"
  };
};

export const parseMysteriousLiteral = (input: string): MysteriousLiteral | null => {
  const isMysterious = mysteriousWords.includes(input.toLowerCase());
  if (!isMysterious) return null;

  return {
    type: "mysterious"
  };
};

export const parseNullLiteral = (input: string): NullLiteral | null => {
  const isNull = nullWords.indexOf(input.toLowerCase()) >= 0;
  if (!isNull) return null;

  return {
    type: "null"
  };
};

export const parseBooleanLiteral = (input: string): BooleanLiteral | null => {
  const isBoolean = input.toLowerCase() in booleanWords;
  if (!isBoolean) return null;

  return {
    type: "boolean",
    value: booleanWords[input.toLowerCase()]
  };
};

export const parsePoeticStringLiteral = (input: string): StringLiteral | null => ({
  type: "string",
  value: input
});

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

export const parseNumberLiteral = (input: string): NumberLiteral | null => {
  const value = parseFloat(input);
  const isNumberLiteral = !isNaN(value);
  if (!isNumberLiteral) return null;

  return {
    type: "number",
    value
  };
};

const literalParsers = [
  parseMysteriousLiteral,
  parseNullLiteral,
  parseStringLiteral,
  parseBooleanLiteral,
  parseNumberLiteral
];

export const parseLiteral = (input: string): Literal | null =>
  literalParsers.reduce<Literal | null>((node, parser) => node || parser(input), null);

const simpleExpressionParsers = [parseLiteral, parsePronoun, parseNamedVariable];

export const parseSimpleExpression = (input: string): SimpleExpression | null =>
  simpleExpressionParsers.reduce<SimpleExpression | null>(
    (node, parser) => node || parser(input),
    null
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

export const parseExpression = (input: string): Expression | null =>
  parseFunctionCall(input) || parseArithmeticExpression(input) || parseSimpleExpression(input);
