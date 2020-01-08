import {
  SimpleExpression,
  Mysterious,
  NullLiteral,
  BooleanLiteral,
  StringLiteral,
  NumberLiteral,
  BinaryOperation,
  Variable,
  Operator,
  Pronoun,
  Expression,
  UnaryOperation,
  Literal
} from "./types";
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

type ExpressionParser = (input: string) => Expression | null;

export const parseVariable = (input: string): Variable | null => {
  // proper variable
  if (/^([A-Z][a-zA-Z]+\s){2,}$/.test(`${input} `)) {
    const properVariable = input // transform to Xxxx Yyyy
      .split(/\s+/)
      .map(x => capitalize(x))
      .join(" ");
    return new Variable(properVariable);
  }

  // common variable
  if (/^(a|an|my|your|the)\s/i.test(input)) return new Variable(input.toLowerCase());

  // simple variable
  if (/^[a-zA-Z]+$/.test(input)) return new Variable(input.toLowerCase());

  return null;
};

export const parsePronoun = (input: string): Pronoun | null => {
  return isPronoun(input) ? new Pronoun() : null;
};

export const parseMysterious = (input: string): Mysterious | null =>
  input.toLowerCase() === "mysterious" ? new Mysterious() : null;

const nullWords = ["null", "nowhere", "nothing", "nobody", "gone", "empty"];

export const parseNullLiteral = (input: string): NullLiteral | null =>
  nullWords.indexOf(input.toLowerCase()) >= 0 ? new NullLiteral() : null;

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

export const parseBooleanLiteral = (input: string): BooleanLiteral | null =>
  input.toLowerCase() in booleanWords
    ? new BooleanLiteral(booleanWords[input.toLowerCase()])
    : null;

export const parsePoeticStringLiteral = (input: string): StringLiteral | null =>
  new StringLiteral(input);

export const parseStringLiteral = (input: string): StringLiteral | null =>
  input.length > 1 && input[0] === '"' && input[input.length - 1] === '"'
    ? new StringLiteral(input.substring(1, input.length - 1))
    : null;

export const parsePoeticNumberLiteral = (input: string): NumberLiteral | null => {
  // replace all dot occurrences, but the first one
  input = input.replace(/\./g, (match, offset, all) => (all.indexOf(".") === offset ? " . " : ""));

  // ignore all non-alphabetical characters
  input = input.replace(/[^A-Za-z0-9\s.-]/g, "");

  const module = (w: string): number => w.length % 10;
  const value = parseFloat(
    input.split(/\s+/).reduce((result, word) => `${result}${word === "." ? "." : module(word)}`, "")
  );
  return new NumberLiteral(value);
};

export const parseNumberLiteral = (input: string): NumberLiteral | null => {
  const num = parseFloat(input);
  return !isNaN(num) ? new NumberLiteral(num) : null;
};

const literalParsers: ExpressionParser[] = [
  parseMysterious,
  parseNullLiteral,
  parseStringLiteral,
  parseBooleanLiteral,
  parseNumberLiteral
];
export const parseLiteral = (input: string): Literal | null =>
  literalParsers.reduce<Literal | null>((node, parser) => node || parser(input), null);

const simpleExpressionParsers: ExpressionParser[] = [
  parseMysterious,
  parseNullLiteral,
  parseStringLiteral,
  parseBooleanLiteral,
  parseNumberLiteral,
  parseVariable
];

const parseSimpleExpression: ExpressionParser = (input: string): SimpleExpression | null =>
  simpleExpressionParsers.reduce<SimpleExpression | null>(
    (node, parser) => node || parser(input),
    null
  );

const binaryOperationParser = (pattern: RegExp, operator: Operator): ExpressionParser => (
  input: string
): BinaryOperation | null => {
  const match = input.match(pattern);
  if (!match) return null;

  const left = parseVariable(match[1]);
  const right = parseSimpleExpression(match[3]);
  if (!left || !right) return null;

  return new BinaryOperation(operator, left, right);
};

const binaryOperationParsers: ExpressionParser[] = [
  binaryOperationParser(/^(.+?) (without|minus) (.+)$/i, "subtract"),
  binaryOperationParser(/^(.+?) (of|times) (.+)$/i, "multiply"),
  binaryOperationParser(/^(.+?) (over) (.+)$/i, "divide"),
  binaryOperationParser(/^(.+?) (plus|with) (.+)$/i, "add")
];

const unaryOperationParser = (pattern: RegExp, operator: Operator): ExpressionParser => (
  input: string
): UnaryOperation | null => {
  const match = input.match(pattern);
  if (!match) return null;

  const right = parseSimpleExpression(match[2]);
  if (!right) return null;

  return new UnaryOperation(operator, right);
};

const unaryOperationParsers: ExpressionParser[] = [
  unaryOperationParser(/^(without|minus) (.+)$/i, "subtract"),
  unaryOperationParser(/^(of|times) (.+)$/i, "multiply"),
  unaryOperationParser(/^(over) (.+)$/i, "divide"),
  unaryOperationParser(/^(plus|with) (.+)$/i, "add")
];

const expressionParsers: ExpressionParser[] = [
  ...binaryOperationParsers,
  ...unaryOperationParsers,
  ...simpleExpressionParsers
];

export const parseExpression = (input: string): Expression | null =>
  expressionParsers.reduce<Expression | null>((node, parser) => node || parser(input), null);
