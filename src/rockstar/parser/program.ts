import { Program, Statement, FunctionDeclaration } from "../ast";
import { anyOf, map, oneOrMany } from "./parsers";
import { functionDeclaration } from "./statements/functionDeclarations";
import { comment } from "./statements/comment";
import { arithmeticRounding } from "./statements/arithmeticRounding";
import { incrementDecrement } from "./statements/incrementDecrement";
import { variableDeclaration } from "./statements/variableDeclaration";
import { assignment } from "./statements/assignment";
import { ifStatement } from "./statements/ifStatement";
import { io } from "./statements/io";
import { loop } from "./statements/loop";

const statement = anyOf<Statement>(
  ifStatement,
  loop,
  comment,
  assignment,
  variableDeclaration,
  incrementDecrement,
  arithmeticRounding,
  io
);

export const program = map(
  (statements: (Statement | FunctionDeclaration)[]) =>
    ({
      type: "program",
      statements
    } as Program),
  oneOrMany(anyOf<Statement | FunctionDeclaration>(functionDeclaration, statement))
);
