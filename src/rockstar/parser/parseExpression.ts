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
  UnaryOperation
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

export type AssignmentType = "is" | "are" | "were" | "was" | "says" | "put" | "let";

type ExpressionParser = (assignment: AssignmentType, expression: string) => Expression | null;

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

const parseMysterious: ExpressionParser = (
  assignment: AssignmentType,
  expression: string
): Expression | null => (expression.toLowerCase() === "mysterious" ? new Mysterious() : null);

const nullWords = ["null", "nowhere", "nothing", "nobody", "gone", "empty"];

const parseNullLiteral: ExpressionParser = (
  assignment: AssignmentType,
  expression: string
): Expression | null =>
  nullWords.indexOf(expression.toLowerCase()) >= 0 ? new NullLiteral() : null;

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

const parseBooleanLiteral: ExpressionParser = (
  assignment: AssignmentType,
  expression: string
): Expression | null =>
  expression.toLowerCase() in booleanWords
    ? new BooleanLiteral(booleanWords[expression.toLowerCase()])
    : null;

const parseStringLiteral: ExpressionParser = (
  assignment: AssignmentType,
  expression: string
): Expression | null =>
  assignment === "says"
    ? new StringLiteral(expression)
    : expression.length > 1 && expression[0] === '"' && expression[expression.length - 1] === '"'
    ? new StringLiteral(expression.substring(1, expression.length - 1))
    : null;

const parsePoeticNumberLiteral = (input: string): number => {
  // replace all dot occurrences, but the first one
  input = input.replace(/\./g, (match, offset, all) => (all.indexOf(".") === offset ? " . " : ""));

  // ignore all non-alphabetical characters
  input = input.replace(/[^A-Za-z0-9\s.-]/g, "");

  const module = (w: string): number => w.length % 10;
  return parseFloat(
    input.split(/\s+/).reduce((result, word) => `${result}${word === "." ? "." : module(word)}`, "")
  );
};

const poeticAssignmentTypes: AssignmentType[] = ["is", "are", "was", "were"];

const parseNumberLiteral: ExpressionParser = (
  assignment: AssignmentType,
  expression: string
): Expression | null => {
  const num = parseFloat(expression);
  if (!isNaN(num)) return new NumberLiteral(num);

  if (poeticAssignmentTypes.indexOf(assignment) >= 0)
    return new NumberLiteral(parsePoeticNumberLiteral(expression));

  return null;
};

const parseVariableIdentifier: ExpressionParser = (
  assignment: AssignmentType,
  expression: string
): Expression | null => parseVariable(expression);

const simpleExpressionParsers: ExpressionParser[] = [
  parseMysterious,
  parseNullLiteral,
  parseStringLiteral,
  parseBooleanLiteral,
  parseNumberLiteral,
  parseVariableIdentifier
];

const parseSimpleExpression: ExpressionParser = (
  assignment: AssignmentType,
  expression: string
): Expression | null =>
  simpleExpressionParsers.reduce<SimpleExpression | null>(
    (node, parser) => node || parser(assignment, expression),
    null
  );

const arithmeticOperationParser = (pattern: RegExp, operator: Operator): ExpressionParser => (
  assignment: AssignmentType,
  expression: string
): Expression | null => {
  const match = expression.match(pattern);
  if (!match) return null;

  const left = parseVariable(match[1]);
  const right = parseSimpleExpression(assignment, match[3]);
  if (!left || !right) return null;

  return new BinaryOperation(operator, left, right);
};

const arithmeticOperationParsers: ExpressionParser[] = [
  arithmeticOperationParser(/^(.+?) (without|minus) (.+)$/i, "subtract"),
  arithmeticOperationParser(/^(.+?) (of|times) (.+)$/i, "multiply"),
  arithmeticOperationParser(/^(.+?) (over) (.+)$/i, "divide"),
  arithmeticOperationParser(/^(.+?) (plus|with) (.+)$/i, "add")
];

const compoundExpressionParser = (pattern: RegExp, operator: Operator): ExpressionParser => (
  assignment: AssignmentType,
  expression: string
): Expression | null => {
  const match = expression.match(pattern);
  if (!match) return null;

  const right = parseSimpleExpression(assignment, match[2]);
  if (!right) return null;

  return new UnaryOperation(operator, right);
};

const compoundExpressionParsers: ExpressionParser[] = [
  compoundExpressionParser(/^(without|minus) (.+)$/i, "subtract"),
  compoundExpressionParser(/^(of|times) (.+)$/i, "multiply"),
  compoundExpressionParser(/^(over) (.+)$/i, "divide"),
  compoundExpressionParser(/^(plus|with) (.+)$/i, "add")
];

const expressionParsers: ExpressionParser[] = [
  ...arithmeticOperationParsers,
  ...compoundExpressionParsers,
  ...simpleExpressionParsers
];

export const parseExpression = (
  assignment: AssignmentType,
  expression: string
): Expression | null =>
  expressionParsers.reduce<SimpleExpression | null>(
    (node, parser) => node || parser(assignment, expression),
    null
  );
