import {
  SimpleExpression,
  Mysterious,
  NullLiteral,
  BooleanLiteral,
  StringLiteral,
  NumberLiteral,
  ArithmeticExpression,
  Variable,
  ArithmeticOperator,
  Pronoun,
  Expression,
  Literal
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

export const isPronoun = (what: string): boolean => pronouns.includes(what.toLowerCase());

export const parseVariable = (input: string): Variable | null => {
  // proper variable
  if (/^([A-Z][a-zA-Z]+\s){2,}$/.test(`${input} `)) {
    const properVariableName = input // transform to Xxxx Yyyy
      .split(/\s+/)
      .map(x => capitalize(x))
      .join(" ");
    const properVariable: Variable = {
      type: "variable",
      name: properVariableName
    };
    return properVariable;
  }

  // common variable
  if (/^(a|an|my|your|the)\s/i.test(input)) {
    const commonVariable: Variable = {
      type: "variable",
      name: input.toLowerCase()
    };
    return commonVariable;
  }

  // simple variable
  if (/^[a-zA-Z]+$/.test(input)) {
    const simpleVariable: Variable = {
      type: "variable",
      name: input.toLowerCase()
    };
    return simpleVariable;
  }

  return null;
};

export const parsePronoun = (input: string): Pronoun | null => {
  if (!isPronoun(input)) return null;

  const pronoun: Pronoun = {
    type: "pronoun"
  };
  return pronoun;
};

export const parseMysterious = (input: string): Mysterious | null => {
  const isMysterious = input.toLowerCase() === "mysterious";
  if (!isMysterious) return null;

  const mysterious: Mysterious = {
    type: "mysterious"
  };
  return mysterious;
};

const nullWords = ["null", "nowhere", "nothing", "nobody", "gone", "empty"];

export const parseNullLiteral = (input: string): NullLiteral | null => {
  const isNull = nullWords.indexOf(input.toLowerCase()) >= 0;
  if (!isNull) return null;

  const nullLiteral: NullLiteral = {
    type: "null"
  };
  return nullLiteral;
};

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

export const parseBooleanLiteral = (input: string): BooleanLiteral | null => {
  const isBoolean = input.toLowerCase() in booleanWords;
  if (!isBoolean) return null;

  const boolean: BooleanLiteral = {
    type: "boolean",
    value: booleanWords[input.toLowerCase()]
  };
  return boolean;
};

export const parsePoeticStringLiteral = (input: string): StringLiteral | null => {
  const stringLiteral: StringLiteral = {
    type: "string",
    value: input
  };
  return stringLiteral;
};

export const parseStringLiteral = (input: string): StringLiteral | null => {
  const isStringLiteral = input.length > 1 && input[0] === '"' && input[input.length - 1] === '"';
  if (!isStringLiteral) return null;

  const stringLiteral: StringLiteral = {
    type: "string",
    value: input.substring(1, input.length - 1)
  };
  return stringLiteral;
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
  const numberLiteral: NumberLiteral = {
    type: "number",
    value
  };
  return numberLiteral;
};

export const parseNumberLiteral = (input: string): NumberLiteral | null => {
  const value = parseFloat(input);
  const isNumberLiteral = !isNaN(value);
  if (!isNumberLiteral) return null;

  const numberLiteral: NumberLiteral = {
    type: "number",
    value
  };
  return numberLiteral;
};

const literalParsers = [
  parseMysterious,
  parseNullLiteral,
  parseStringLiteral,
  parseBooleanLiteral,
  parseNumberLiteral
];

export const parseLiteral = (input: string): Literal | null => {
  return literalParsers.reduce<Literal | null>((node, parser) => node || parser(input), null);
};

const simpleExpressionParsers = [parseLiteral, parsePronoun, parseVariable];

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

  const left = parseVariable(match[1]);
  const right = parseSimpleExpression(match[3]);
  if (!left || !right) return null;

  const binaryOperation: ArithmeticExpression = {
    type: "arithmeticExpression",
    operator,
    left,
    right
  };
  return binaryOperation;
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

export const parseExpression = (input: string): Expression | null =>
  parseArithmeticExpression(input) || parseSimpleExpression(input);
