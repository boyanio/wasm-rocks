import {
  Statement,
  Program,
  Expression,
  Assignment,
  NamedVariable,
  Pronoun,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  NullLiteral,
  MysteriousLiteral,
  VariableDeclaration,
  Literal,
  BinaryExpression,
  BinaryOperator
} from "../../../src/rockstar/ast";

export const string = (value: string): StringLiteral => ({
  type: "string",
  value
});

export const number = (value: number): NumberLiteral => ({
  type: "number",
  value
});

export const boolean = (value: boolean): BooleanLiteral => ({
  type: "boolean",
  value
});

export const $null: NullLiteral = {
  type: "null"
};

export const mysterious: MysteriousLiteral = {
  type: "mysterious"
};

export const variable = (name: string): NamedVariable => ({
  type: "variable",
  name
});

export const pronoun: Pronoun = { type: "pronoun" };

export const assignment = (target: NamedVariable, expression: Expression): Assignment => ({
  type: "assignment",
  target,
  expression
});

export const variableDeclaration = (
  variable: NamedVariable,
  value: Literal
): VariableDeclaration => ({
  type: "variableDeclaration",
  variable,
  value
});

export const binaryExpression = (
  operator: BinaryOperator,
  lhs: Expression,
  rhs: Expression
): BinaryExpression => ({
  type: "binaryExpression",
  operator,
  lhs,
  rhs
});

export const program = (statements: Statement[]): Program => ({
  type: "program",
  statements
});
