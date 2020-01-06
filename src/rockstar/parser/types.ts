import { escapeDoubleQuotes } from "../../utils/string-utils";

export type ProgramNodeType =
  | "comment"
  | "assignment"
  | "number"
  | "string"
  | "null"
  | "mysterious"
  | "boolean"
  | "explicitIdentifier"
  | "implicitIdentifier"
  | "binaryExpression"
  | "function"
  | "call";

export abstract class ProgramNode {
  constructor(public type: ProgramNodeType) {}

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
  constructor(public target: IdentifierNode, public expression: ExpressionNode) {
    super("assignment");
  }

  toString(): string {
    return `${this.type} { target = "${this.target}", expression = ${this.expression} }`;
  }
}

export class NumberLiteralNode extends ProgramNode {
  constructor(public value: number) {
    super("number");
  }

  toString(): string {
    return this.value.toString();
  }
}

export class StringLiteralNode extends ProgramNode {
  constructor(public value: string) {
    super("string");
  }

  toString(): string {
    return `"${escapeDoubleQuotes(this.value)}"`;
  }
}

export class BooleanLiteralNode extends ProgramNode {
  constructor(public value: boolean) {
    super("boolean");
  }

  toString(): string {
    return this.value.toString();
  }
}

export class MysteriousLiteralNode extends ProgramNode {
  constructor() {
    super("mysterious");
  }

  toString(): string {
    return "mysterious";
  }
}

export class NullLiteralNode extends ProgramNode {
  constructor() {
    super("null");
  }

  toString(): string {
    return "null";
  }
}

export abstract class IdentifierNode extends ProgramNode {}

export class ExplicitIdentifierNode extends IdentifierNode {
  constructor(public name: string) {
    super("explicitIdentifier");
  }

  toString(): string {
    return `var("${this.name}")`;
  }
}

export class ImplicitIdentifierNode extends IdentifierNode {
  constructor() {
    super("implicitIdentifier");
  }

  toString(): string {
    return `var()`;
  }
}

export class BinaryExpressionNode extends ProgramNode {
  constructor(
    public operator: Operator,
    public left: ExpressionNode,
    public right: ExpressionNode
  ) {
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

export class FunctionDeclarationNode extends ProgramNode {
  constructor(
    public name: string,
    public args: ExpressionNode[],
    public result: ExpressionNode,
    public body: StatementNode[]
  ) {
    super("function");
  }

  toString(): string {
    return `Function { name = "${this.name}", args = [${this.args.join(", ")}], result = ${
      this.result
    } }`;
  }
}

export type Operator = "add" | "subtract" | "divide" | "multiply";

export type ExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | MysteriousLiteralNode
  | NullLiteralNode
  | BooleanLiteralNode
  | IdentifierNode;

export type StatementNode =
  | CommentNode
  | AssignmentNode
  | FunctionCallNode
  | FunctionDeclarationNode;

export type Program = StatementNode[];

export type Parser = (program: Program, lines: string[], lineIndex: number) => number;
