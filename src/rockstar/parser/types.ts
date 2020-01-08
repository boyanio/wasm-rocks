import { escapeDoubleQuotes } from "../../utils/string-utils";

export type ProgramNodeType =
  | "comment"
  | "assignment"
  | "number"
  | "string"
  | "null"
  | "mysterious"
  | "boolean"
  | "variable"
  | "pronoun"
  | "binaryOperation"
  | "unaryOperation"
  | "inPlaceMutation"
  | "function"
  | "call"
  | "say"
  | "variable";

export abstract class ProgramNode {
  constructor(public type: ProgramNodeType) {}

  toString(): string {
    return this.type;
  }
}

export class Comment extends ProgramNode {
  constructor(public value: string) {
    super("comment");
  }

  toString(): string {
    return `${this.type} { value = "${escapeDoubleQuotes(this.value)}" }`;
  }
}

export class NumberLiteral extends ProgramNode {
  constructor(public value: number) {
    super("number");
  }

  toString(): string {
    return this.value.toString();
  }
}

export class StringLiteral extends ProgramNode {
  constructor(public value: string) {
    super("string");
  }

  toString(): string {
    return `"${escapeDoubleQuotes(this.value)}"`;
  }
}

export class BooleanLiteral extends ProgramNode {
  constructor(public value: boolean) {
    super("boolean");
  }

  toString(): string {
    return this.value.toString();
  }
}

export class Mysterious extends ProgramNode {
  constructor() {
    super("mysterious");
  }

  toString(): string {
    return "mysterious";
  }
}

export class NullLiteral extends ProgramNode {
  constructor() {
    super("null");
  }

  toString(): string {
    return "null";
  }
}

export class Variable extends ProgramNode {
  constructor(public name: string) {
    super("variable");
  }

  toString(): string {
    return `var("${this.name}")`;
  }
}

export class Pronoun extends ProgramNode {
  constructor() {
    super("pronoun");
  }

  toString(): string {
    return `pronoun()`;
  }
}

export class Assignment extends ProgramNode {
  constructor(public target: Identifier, public expression: Expression) {
    super("assignment");
  }

  toString(): string {
    return `${this.type} { target = "${this.target}", expression = ${this.expression} }`;
  }
}

export class VariableDeclaration extends ProgramNode {
  constructor(public variable: Variable, public value: Literal) {
    super("variable");
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
  constructor(
    public operator: Operator,
    public left: SimpleExpression,
    public right: SimpleExpression
  ) {
    super("binaryOperation");
  }

  toString(): string {
    return `${this.left} ${operatorSymbols[this.operator]} ${this.right}`;
  }
}

export class UnaryOperation extends ProgramNode {
  constructor(public operator: Operator, public expression: SimpleExpression) {
    super("unaryOperation");
  }

  toString(): string {
    return `${operatorSymbols[this.operator]} ${this.expression}`;
  }
}

export class FunctionCall extends ProgramNode {
  constructor(public name: string, public args: SimpleExpression[]) {
    super("call");
  }

  toString(): string {
    return `${this.name}(${this.args.join(", ")})`;
  }
}

export class FunctionDeclaration extends ProgramNode {
  constructor(
    public name: string,
    public args: Variable[],
    public result: SimpleExpression,
    public body: Statement[]
  ) {
    super("function");
  }

  toString(): string {
    return `Function { name = "${this.name}", args = [${this.args.join(", ")}], result = ${
      this.result
    } }`;
  }
}

export type InPlaceMutationType = "buildUp" | "knockDown" | "turnUp" | "turnDown" | "turnRound";

export class InPlaceMutation extends ProgramNode {
  constructor(public mutationType: InPlaceMutationType, public target: Identifier) {
    super("inPlaceMutation");
  }

  toString(): string {
    return `${this.mutationType}(${this.target})`;
  }
}

export class SayCall extends ProgramNode {
  constructor(public what: SimpleExpression) {
    super("say");
  }

  toString(): string {
    return `${this.type}(${this.what})`;
  }
}

export type Identifier = Variable | Pronoun;

export type Literal = NumberLiteral | StringLiteral | BooleanLiteral | Mysterious | NullLiteral;

export type SimpleExpression = Literal | Identifier;

export type Expression = SimpleExpression | BinaryOperation | UnaryOperation | FunctionCall;

export type Statement =
  | Comment
  | Assignment
  | FunctionCall
  | FunctionDeclaration
  | InPlaceMutation
  | SayCall
  | VariableDeclaration;

export type Program = Statement[];

export type Parser = (program: Program, lines: string[], lineIndex: number) => number;
