export type Identifier = string;

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

export type Literal = NumberLiteral | StringLiteral | ConstantLiteral;

export type Variable = {
  type: "variable";
  name: Identifier;
};

export type Pronoun = {
  type: "pronoun";
};

export type SimpleExpression = Literal | Variable | Pronoun;

export type FunctionCallExpression = {
  type: "functionCall";
  name: Identifier;
  args: SimpleExpression[];
};

export type UnaryOperator = "not";

export type UnaryExpression = {
  type: "unaryExpression";
  rhs: Expression;
  operator: UnaryOperator;
};

export type Comparator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "greaterThanOrEquals"
  | "lowerThan"
  | "lowerThanOrEquals";

export type LogicalOperator = "and" | "or" | "nor" | "not";

export type ArithmeticOperator = "add" | "subtract" | "multiply" | "divide";

export type BinaryOperator = Comparator | LogicalOperator | ArithmeticOperator;

export type BinaryExpression = {
  type: "binaryExpression";
  lhs: Expression;
  rhs: Expression;
  operator: BinaryOperator;
};

export type Operator = BinaryOperator | UnaryOperator;

export type Expression =
  | SimpleExpression
  | FunctionCallExpression
  | BinaryExpression
  | UnaryExpression;

export type ExpressionType = "string" | "boolean" | "integer" | "float" | "mysterious" | "null";

export type VariableDeclaration = {
  type: "variableDeclaration";
  variable: Variable;
  value: Literal;
};

export type FunctionDeclaration = {
  type: "function";
  name: Identifier;
  args: Variable[];
  result: SimpleExpression;
  statements: Statement[];
};

export type ArithmeticRoundingDirection = "up" | "down" | "upOrDown";

export type ArithmeticRoundingOperation = {
  type: "round";
  target: Variable | Pronoun;
  direction: ArithmeticRoundingDirection;
};

export type IncrementOperation = {
  type: "increment";
  target: Variable | Pronoun;
  times: number;
};

export type DecrementOperation = {
  type: "decrement";
  target: Variable | Pronoun;
  times: number;
};

export type SayStatement = {
  type: "say";
  what: SimpleExpression;
};

export type ListenStatement = {
  type: "listen";
  to: Variable;
};

export type IOOperation = SayStatement | ListenStatement;

export type Assignment = {
  type: "assignment";
  target: Variable;
  expression: Expression;
};

export type Comment = {
  type: "comment";
  comment: string;
};

export type Statement =
  | Comment
  | Assignment
  | IOOperation
  | VariableDeclaration
  | ArithmeticRoundingOperation
  | IncrementOperation
  | DecrementOperation
  | IfStatement
  | Loop;

export type Block = {
  statements: Statement[];
};

export type IfStatement = {
  type: "if";
  condition: Expression;
  then: Block;
  else: Block | null;
};

export type Loop = {
  type: "loop";
  condition: Expression;
  block: Block;
};

export type Program = {
  type: "program";
  statements: (Statement | FunctionDeclaration)[];
};

export type Scope = Program | FunctionDeclaration;
