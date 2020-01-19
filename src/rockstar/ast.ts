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

export type ConstantLiteral = MysteriousLiteral | NullLiteral | BooleanLiteral;

export type NumberLiteral = {
  type: "number";
  value: number;
};

export type StringLiteral = {
  type: "string";
  value: string;
};

export type ExpressionType = "string" | "boolean" | "integer" | "float" | "mysterious" | "null";

export type Literal = NumberLiteral | StringLiteral | ConstantLiteral;

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
  times: number;
};

export type DecrementOperation = {
  type: "decrement";
  target: Variable;
  times: number;
};

export type SayCall = {
  type: "say";
  what: SimpleExpression;
};

export type IOOperation = SayCall;

export type Assignment = {
  type: "assignment";
  target: NamedVariable;
  expression: Expression;
};

export type Comment = {
  type: "comment";
  comment: string;
};

export type BlockStatement = {
  type: "block";
  statements: Statement[];
};

export type LogicalOperator = "and" | "or" | "nor" | "not";

export type Comparator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "greaterThanOrEquals"
  | "lowerThan"
  | "lowerThanOrEquals";

export type ArithmeticOperator = "add" | "subtract" | "multiply" | "divide";

export type UnaryOperator = "not";

export type UnaryExpression = {
  type: "unaryExpression";
  rhs: Expression;
  operator: BinaryOperator;
};

export type BinaryOperator = Comparator | LogicalOperator | ArithmeticOperator;

export type BinaryExpression = {
  type: "binaryExpression";
  lhs: Expression;
  rhs: Expression;
  operator: BinaryOperator;
};

export type Operator = BinaryOperator | UnaryOperator;

export type Expression = SimpleExpression | FunctionCall | BinaryExpression | UnaryExpression;

export type IfStatement = {
  type: "if";
  condition: Expression;
  then: BlockStatement;
  else?: BlockStatement;
};

export type Statement =
  | Comment
  | Assignment
  | FunctionDeclaration
  | IOOperation
  | VariableDeclaration
  | ArithmeticRoundingOperation
  | IncrementOperation
  | DecrementOperation
  | IfStatement;

export type Program = {
  type: "program";
  statements: Statement[];
};

export type Scope = Program | FunctionDeclaration;
