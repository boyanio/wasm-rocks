import {
  ExpressionNode,
  MysteriousLiteralNode,
  NullLiteralNode,
  BooleanLiteralNode,
  StringLiteralNode,
  NumberLiteralNode,
  BinaryExpressionNode,
  IdentifierNode,
  Operator
} from "./types";
import { capitalize } from "../../string-utils";

export const parseVariableName = (input: string): string | null => {
  // proper variable
  if (/^([A-Z][a-zA-Z]+\s){2,}$/.test(`${input} `))
    return input // transform to Xxxx Yyyy
      .split(/\s+/)
      .map(x => capitalize(x))
      .join(" ");

  // common variable
  if (/^(a|an|my|your|the)\s/i.test(input)) return input.toLowerCase();

  // simple variable
  if (/^[a-zA-Z]+$/.test(input)) return input.toLowerCase();

  return null;
};

export type AssignmentType = "is" | "are" | "were" | "was" | "says" | "put" | "let";

type ExpressionParser = (variable: string, assignment: AssignmentType, expression: string) => ExpressionNode | null;

const parseMysteriousExpression: ExpressionParser = (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null => (expression.toLowerCase() === "mysterious" ? new MysteriousLiteralNode() : null);

const nullWords = ["null", "nowhere", "nothing", "nobody", "gone", "empty"];

const parseNullExpression: ExpressionParser = (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null => (nullWords.indexOf(expression.toLowerCase()) >= 0 ? new NullLiteralNode() : null);

const booleanWords = {
  true: true,
  right: true,
  yes: true,
  ok: true,
  false: false,
  no: false,
  lies: false,
  wrong: false
};

const parseBooleanExpression: ExpressionParser = (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null =>
  expression.toLowerCase() in booleanWords ? new BooleanLiteralNode(booleanWords[expression.toLowerCase()]) : null;

const parseStringExpression: ExpressionParser = (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null =>
  assignment === "says"
    ? new StringLiteralNode(expression)
    : expression.length > 1 && expression[0] === '"' && expression[expression.length - 1] === '"'
    ? new StringLiteralNode(expression.substring(1, expression.length - 1))
    : null;

const parsePeticNumberLiteral = (input: string): number => {
  // replace all dot occurrences, but the first one
  input = input.replace(/\./g, (match, offset, all) => (all.indexOf(".") === offset ? " . " : ""));

  // ignore all non-alphabetical characters
  input = input.replace(/[^A-Za-z0-9\s\.\-]/g, "");

  const module = (w: string): number => w.length % 10;
  return parseFloat(input.split(/\s+/).reduce((result, word) => `${result}${word === "." ? "." : module(word)}`, ""));
};

const poeticAssignmentTypes: AssignmentType[] = ["is", "are", "was", "were"];

const parseNumberExpression: ExpressionParser = (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null => {
  const num = parseFloat(expression);
  if (!isNaN(num)) return new NumberLiteralNode(num);

  if (poeticAssignmentTypes.indexOf(assignment) >= 0) return new NumberLiteralNode(parsePeticNumberLiteral(expression));

  return null;
};

const parseIdentifierExpression: ExpressionParser = (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null => new IdentifierNode(expression);

const simpleExpressionParsers: ExpressionParser[] = [
  parseMysteriousExpression,
  parseNullExpression,
  parseStringExpression,
  parseBooleanExpression,
  parseNumberExpression,
  parseIdentifierExpression
];

const parseSimpleExpression = (variable: string, assignment: AssignmentType, expression: string): ExpressionNode =>
  simpleExpressionParsers.reduce<ExpressionNode>(
    (node, parser) => node || parser(variable, assignment, expression),
    null
  );

const binaryExpressionParser = (pattern: RegExp, operator: Operator): ExpressionParser => (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null => {
  const match = expression.match(pattern);
  if (!match) return null;

  const left = parseVariableName(match[1]);
  const right = parseSimpleExpression(variable, assignment, match[3]);
  if (!left || !right) return null;

  return new BinaryExpressionNode(operator, new IdentifierNode(left), right);
};

const binaryExpressionParsers: ExpressionParser[] = [
  binaryExpressionParser(/^(.+?) (without|minus) (.+)$/i, "subtract"),
  binaryExpressionParser(/^(.+?) (of|times) (.+)$/i, "multiply"),
  binaryExpressionParser(/^(.+?) (over) (.+)$/i, "divide"),
  binaryExpressionParser(/^(.+?) (plus|with) (.+)$/i, "add")
];

const compountExpressionParser = (pattern: RegExp, operator: Operator): ExpressionParser => (
  variable: string,
  assignment: AssignmentType,
  expression: string
): ExpressionNode | null => {
  const match = expression.match(pattern);
  if (!match) return null;

  const right = parseSimpleExpression(variable, assignment, match[2]);
  if (!right) return null;

  return new BinaryExpressionNode(operator, new IdentifierNode(variable), right);
};

const compountExpressionParsers: ExpressionParser[] = [
  compountExpressionParser(/^(without|minus) (.+)$/i, "subtract"),
  compountExpressionParser(/^(of|times) (.+)$/i, "multiply"),
  compountExpressionParser(/^(over) (.+)$/i, "divide"),
  compountExpressionParser(/^(plus|with) (.+)$/i, "add")
];

const expressionParsers: ExpressionParser[] = [
  ...binaryExpressionParsers,
  ...compountExpressionParsers,
  ...simpleExpressionParsers
];

export const parseExpression = (variable: string, assignment: AssignmentType, expression: string): ExpressionNode =>
  expressionParsers.reduce<ExpressionNode>((node, parser) => node || parser(variable, assignment, expression), null);
