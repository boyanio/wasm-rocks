export type Comment = {
  type: "comment";
  comment: string;
};

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

export type Mysterious = {
  type: "mysterious";
};

export type NullLiteral = {
  type: "null";
};

export type Literal = NumberLiteral | StringLiteral | BooleanLiteral | Mysterious | NullLiteral;

export type Variable = {
  type: "variable";
  name: string;
};

export type Pronoun = {
  type: "pronoun";
};

export type Identifier = Variable | Pronoun;

export type SimpleExpression = Literal | Identifier;

export type VariableDeclaration = {
  type: "variableDeclaration";
  variable: Variable;
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
  name: string;
  args: SimpleExpression[];
};

export type FunctionDeclaration = {
  type: "function";
  name: string;
  args: Variable[];
  result: SimpleExpression;
  statements: Statement[];
};

export type ArithmeticRoundingDirection = "up" | "down" | "upOrDown";

export type ArithmeticRoundingOperation = {
  type: "round";
  target: Identifier;
  direction: ArithmeticRoundingDirection;
};

export type IncrementOperation = {
  type: "increment";
  target: Identifier;
};

export type DecrementOperation = {
  type: "decrement";
  target: Identifier;
};

export type SayCall = {
  type: "say";
  what: SimpleExpression;
};

export type SimpleAssignment = {
  type: "simpleAssignment";
  target: Identifier;
  expression: SimpleExpression | ArithmeticExpression;
};

export type CompoundAssignment = {
  type: "compoundAssignment";
  target: Identifier;
  operator: ArithmeticOperator;
  right: SimpleExpression;
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

export type Program = Statement[];
