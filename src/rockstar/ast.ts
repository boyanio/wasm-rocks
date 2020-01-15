export type NumberLiteral = {
  type: "number";
  value: number;
};

export type StringLiteral = {
  type: "string";
  value: string;
};

export type BooleanLiteral = {
  type: "boolean";
  value: boolean;
};

export type MysteriousLiteral = {
  type: "mysterious";
};

export type NullLiteral = {
  type: "null";
};

export type Literal =
  | NumberLiteral
  | StringLiteral
  | BooleanLiteral
  | MysteriousLiteral
  | NullLiteral;

export type NamedVariable = {
  type: "variable";
  name: Identifier;
};

export type Pronoun = {
  type: "pronoun";
};

export type Variable = NamedVariable | Pronoun;

export type Identifier = string;

export type SimpleExpression = Literal | Variable;

export type VariableDeclaration = {
  type: "variableDeclaration";
  variable: NamedVariable;
  value: Literal;
};

export type ArithmeticOperator = "add" | "subtract" | "divide" | "multiply";

export type ArithmeticExpression = {
  type: "arithmeticExpression";
  operator: ArithmeticOperator;
  left: SimpleExpression;
  right: SimpleExpression;
};

export type FunctionCall = {
  type: "call";
  name: Identifier;
  args: SimpleExpression[];
};

export type FunctionDeclaration = {
  type: "function";
  name: Identifier;
  args: NamedVariable[];
  result: SimpleExpression;
  statements: Statement[];
};

export type ArithmeticRoundingDirection = "up" | "down" | "upOrDown";

export type ArithmeticRoundingOperation = {
  type: "round";
  target: Variable;
  direction: ArithmeticRoundingDirection;
};

export type IncrementOperation = {
  type: "increment";
  target: Variable;
};

export type DecrementOperation = {
  type: "decrement";
  target: Variable;
};

export type SayCall = {
  type: "say";
  what: SimpleExpression;
};

export type SimpleAssignment = {
  type: "simpleAssignment";
  target: Variable;
  expression: SimpleExpression | ArithmeticExpression | FunctionCall;
};

export type CompoundAssignment = {
  type: "compoundAssignment";
  target: Variable;
  operator: ArithmeticOperator;
  right: SimpleExpression;
};

export type Comment = {
  type: "comment";
  comment: string;
};

export type Assignment = SimpleAssignment | CompoundAssignment;

export type Expression = SimpleExpression | ArithmeticExpression | FunctionCall;

export type Statement =
  | Comment
  | Assignment
  | FunctionCall
  | FunctionDeclaration
  | SayCall
  | VariableDeclaration
  | ArithmeticRoundingOperation
  | IncrementOperation
  | DecrementOperation;

export type Program = {
  type: "program";
  statements: Statement[];
};

export type Scope = Program | FunctionDeclaration;
