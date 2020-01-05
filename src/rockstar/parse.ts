export type ExpressionNode = NumberLiteralNode | StringLiteralNode;

export interface ProgramNode {
  type: string;
}

export interface CommentNode extends ProgramNode {
  type: "comment";
  value: string;
}

export interface VariableDeclarationNode extends ProgramNode {
  type: "variableDeclaration";
  name: string;
  expression: ExpressionNode;
}

export interface NumberLiteralNode extends ProgramNode {
  type: "numberLiteral";
  value: number;
}

export interface StringLiteralNode extends ProgramNode {
  type: "stringLiteral";
  value: string;
}

export type StatementNode = CommentNode | VariableDeclarationNode;

export type Program = StatementNode[];

type Parser = (program: Program, lines: string[], lineIndex: number) => number;

const parseExpression = (program: Program, input: string): ExpressionNode => {
  const number = parseFloat(input);
  if (!isNaN(number)) {
    const numberNode: NumberLiteralNode = {
      type: "numberLiteral",
      value: number
    };
    return numberNode;
  }

  const stringNode: StringLiteralNode = {
    type: "stringLiteral",
    value: input
  };
  return stringNode;
};

const formatProperVariableName = (input: string): string => {
  return input // proper variable, transform to Xxxx Yyyy
    .split(/\s/)
    .map(x => x[0].toUpperCase() + x.substring(1).toLowerCase())
    .join(" ");
};

const commentParser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];
  const isComment =
    line.charAt(0) === "(" && line.charAt(line.length - 1) === ")";
  if (isComment) {
    const node: CommentNode = {
      type: "comment",
      value: line.substring(1, line.length - 1)
    };
    program.push(node);
    return lineIndex + 1;
  }
  return lineIndex;
};

const variableParser = (
  program: Program,
  lines: string[],
  lineIndex: number
): number => {
  const line = lines[lineIndex];
  let match: RegExpMatchArray;
  let variableName: string;
  const simpleOrCommonVariableMatch = line.match(
    /^(((a|an|my|your|the)\s)?[a-zA-Z]+)\s+is\s+(.+)/i
  );
  match = simpleOrCommonVariableMatch;
  if (match) {
    variableName = match[1].toLowerCase();
  } else {
    const properVariableMatch = line.match(
      /^(([A-Z][a-zA-Z]+\s){2,})is\s+(.+)/
    );
    match = properVariableMatch;
    if (match) {
      variableName = formatProperVariableName(match[1].trim());
    }
  }
  if (match) {
    const node: VariableDeclarationNode = {
      type: "variableDeclaration",
      name: variableName,
      expression: parseExpression(program, match[match.length - 1])
    };
    program.push(node);
    return lineIndex + 1;
  }
  return lineIndex;
};

const parsers: Parser[] = [commentParser, variableParser];

const parseLines = (program: Program, lines: string[]): void => {
  let lineIndex = 0;
  let parsed = false;

  do {
    parsed = false;

    for (const parser of parsers) {
      const nextLineIndex = parser(program, lines, lineIndex);
      if (nextLineIndex > lineIndex) {
        lineIndex = nextLineIndex;
        parsed = true;
        break;
      }
    }

    if (!parsed) throw new Error(`Parse error at line ${lineIndex}`);
  } while (lineIndex < lines.length);
};

export function parse(input: string): Program {
  const program: Program = [];
  const lines = input.split(/\r?\n/);
  parseLines(program, lines);
  return program;
}
