import { escapeDoubleQuotes } from "../../utils/string-utils";

export abstract class ProgramNode {
  constructor(public type: string) {}

  toString(): string {
    return this.type;
  }
}

export class Comment extends ProgramNode {
  static type = "comment";

  constructor(public value: string) {
    super(Comment.type);
  }

  toString(): string {
    return `${this.type} { value = "${escapeDoubleQuotes(this.value)}" }`;
  }
}

export class NumberLiteral extends ProgramNode {
  static type = "number";

  constructor(public value: number) {
    super(NumberLiteral.type);
  }

  toString(): string {
    return this.value.toString();
  }
}

export class StringLiteral extends ProgramNode {
  static type = "string";

  constructor(public value: string) {
    super(StringLiteral.type);
  }

  toString(): string {
    return `"${escapeDoubleQuotes(this.value)}"`;
  }
}

export class BooleanLiteral extends ProgramNode {
  static type = "boolean";

  constructor(public value: boolean) {
    super(BooleanLiteral.type);
  }

  toString(): string {
    return this.value.toString();
  }
}

export class Mysterious extends ProgramNode {
  static type = "mysterious";

  constructor() {
    super(Mysterious.type);
  }

  toString(): string {
    return Mysterious.type;
  }
}

export class NullLiteral extends ProgramNode {
  static type = "null";

  constructor() {
    super(NullLiteral.type);
  }

  toString(): string {
    return NullLiteral.type;
  }
}

export class Variable extends ProgramNode {
  static type = "variable";

  constructor(public name: string) {
    super(Variable.type);
  }

  toString(): string {
    return `var("${this.name}")`;
  }
}

export class Pronoun extends ProgramNode {
  static type = "pronoun";

  constructor() {
    super(Pronoun.type);
  }

  toString(): string {
    return `pronoun()`;
  }
}

export class Assignment extends ProgramNode {
  static type = "assignment";

  constructor(public target: Identifier, public expression: Expression) {
    super(Assignment.type);
  }

  toString(): string {
    return `${this.type} { target = "${this.target}", expression = ${this.expression} }`;
  }
}

export class VariableDeclaration extends ProgramNode {
  static type = "variableDeclaration";

  constructor(public variable: Variable, public value: Literal) {
    super(VariableDeclaration.type);
  }

  toString(): string {
    return `${this.variable} = ${this.value}`;
  }
}

export type Operator = "add" | "subtract" | "divide" | "multiply";

const operatorSymbols: { [key: string]: string } = {
  add: "+",
  subtract: "-",
  divide: "/",
  multiply: "*"
};

export class BinaryOperation extends ProgramNode {
  static type = "binaryOperation";

  constructor(
    public operator: Operator,
    public left: SimpleExpression,
    public right: SimpleExpression
  ) {
    super(BinaryOperation.type);
  }

  toString(): string {
    return `${this.left} ${operatorSymbols[this.operator]} ${this.right}`;
  }
}

export class UnaryOperation extends ProgramNode {
  static type = "unaryOperation";

  constructor(public operator: Operator, public expression: SimpleExpression) {
    super(UnaryOperation.type);
  }

  toString(): string {
    return `${operatorSymbols[this.operator]} ${this.expression}`;
  }
}

export class FunctionCall extends ProgramNode {
  static type = "call";

  constructor(public name: string, public args: SimpleExpression[]) {
    super(FunctionCall.type);
  }

  toString(): string {
    return `${this.name}(${this.args.join(", ")})`;
  }
}

export class FunctionDeclaration extends ProgramNode {
  static type = "function";

  constructor(
    public name: string,
    public args: Variable[],
    public result: SimpleExpression,
    public body: Statement[]
  ) {
    super(FunctionDeclaration.type);
  }

  toString(): string {
    return `Function { name = "${this.name}", args = [${this.args.join(", ")}], result = ${
      this.result
    } }`;
  }
}

export class RoundOperation extends ProgramNode {
  static type = "round";

  constructor(public target: Identifier) {
    super(RoundOperation.type);
  }

  toString(): string {
    return `${this.type}(${this.target})`;
  }
}

export class RoundUpOperation extends ProgramNode {
  static type = "roundUp";

  constructor(public target: Identifier) {
    super(RoundUpOperation.type);
  }

  toString(): string {
    return `${this.type}(${this.target})`;
  }
}

export class RoundDownOperation extends ProgramNode {
  static type = "roundDown";

  constructor(public target: Identifier) {
    super(RoundDownOperation.type);
  }

  toString(): string {
    return `${this.type}(${this.target})`;
  }
}

export type ArithmeticRoundingOperation = RoundOperation | RoundUpOperation | RoundDownOperation;

export class IncrementOperation extends ProgramNode {
  static type = "increment";

  constructor(public target: Identifier) {
    super(IncrementOperation.type);
  }

  toString(): string {
    return `increment(${this.target})`;
  }
}

export class DecrementOperation extends ProgramNode {
  static type = "decrement";

  constructor(public target: Identifier) {
    super(DecrementOperation.type);
  }

  toString(): string {
    return `decrement(${this.target})`;
  }
}

export class SayCall extends ProgramNode {
  static type = "say";

  constructor(public what: SimpleExpression) {
    super(SayCall.type);
  }

  toString(): string {
    return `${this.type}(${this.what})`;
  }
}

export type Identifier = Variable | Pronoun;

export const isIdentifier = (node: ProgramNode): boolean =>
  [Variable.type, Pronoun.type].includes(node.type);

export type Literal = NumberLiteral | StringLiteral | BooleanLiteral | Mysterious | NullLiteral;

export const isLiteral = (node: ProgramNode): boolean =>
  [
    NumberLiteral.type,
    StringLiteral.type,
    BooleanLiteral.type,
    Mysterious.type,
    NullLiteral.type
  ].includes(node.type);

export type SimpleExpression = Literal | Identifier;

export const isSimpleExpression = (node: ProgramNode): boolean =>
  isLiteral(node) || isIdentifier(node);

export type Expression = SimpleExpression | BinaryOperation | UnaryOperation | FunctionCall;

export type Statement =
  | Comment
  | Assignment
  | FunctionCall
  | FunctionDeclaration
  | SayCall
  | VariableDeclaration
  | RoundOperation
  | IncrementOperation
  | DecrementOperation;

export type Program = Statement[];

export type Parser = (program: Program, lines: string[], lineIndex: number) => number;
