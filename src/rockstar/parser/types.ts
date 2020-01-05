import { escapeDoubleQuotes } from "../../string-utils";

export type ExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | MysteriousLiteralNode
  | NullLiteralNode
  | BooleanLiteralNode;

export abstract class ProgramNode {
  constructor(public type: string) {}

  toString(): string {
    return this.type;
  }
}

export class CommentNode extends ProgramNode {
  constructor(public value: string) {
    super("comment");
  }

  toString(): string {
    return `${this.type} { value = "${escapeDoubleQuotes(this.value)}" }`;
  }
}

export class AssignmentNode extends ProgramNode {
  constructor(public name: string, public expression: ExpressionNode) {
    super("assignment");
  }

  toString(): string {
    return `${this.type} { name = "${this.name}", expression = ${this.expression} }`;
  }
}

export class NumberLiteralNode extends ProgramNode {
  constructor(public value: number) {
    super("numberLiteral");
  }

  toString(): string {
    return this.value.toString();
  }
}

export class StringLiteralNode extends ProgramNode {
  constructor(public value: string) {
    super("stringLiteral");
  }

  toString(): string {
    return `"${escapeDoubleQuotes(this.value)}"`;
  }
}

export class BooleanLiteralNode extends ProgramNode {
  constructor(public value: boolean) {
    super("booleanLiteral");
  }

  toString(): string {
    return this.value.toString();
  }
}

export class MysteriousLiteralNode extends ProgramNode {
  constructor() {
    super("mysteriousLiteral");
  }

  toString(): string {
    return "mysterious";
  }
}

export class NullLiteralNode extends ProgramNode {
  constructor() {
    super("nullLiteral");
  }

  toString(): string {
    return "null";
  }
}

export class IdentifierNode extends ProgramNode {
  constructor(public name: string) {
    super("identifier");
  }

  toString(): string {
    return `var("${this.name}")`;
  }
}

export class BinaryExpressionNode extends ProgramNode {
  constructor(public operator: Operator, public left: ExpressionNode, public right: ExpressionNode) {
    super("binaryExpression");
  }

  toString(): string {
    return `${this.operator}(${this.left}, ${this.right})`;
  }
}

export class FunctionCallNode extends ProgramNode {
  constructor(public name: string, public args: ExpressionNode[]) {
    super("call");
  }

  toString(): string {
    return `${this.name}(${this.args.join(", ")})`;
  }
}

export type Operator = "add" | "subtract" | "divide" | "multiply";

export type StatementNode = CommentNode | AssignmentNode;

export type Program = StatementNode[];

export type Parser = (program: Program, lines: string[], lineIndex: number) => number;
