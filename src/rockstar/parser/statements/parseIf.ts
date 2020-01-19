// import { Parser } from "./types";
// import { Scope, IfStatement } from "../ast";
// import { parseExpression } from "./parseExpression";

// const parseIf = (line: string): IfStatement | null => {
//   const match = line.match(/^if (.+)$/i);
//   if (!match) return null;

//   const what = parseSimpleExpression(match[2]);
//   if (!what) return null;

//   return {
//     type: "say",
//     what
//   };
// };

// export const parseIf: Parser = (scope: Scope, lines: string[], lineIndex: number): number => {
//   const line = lines[lineIndex];

//   const node = parseIf(line);
//   if (!node) return lineIndex;

//   scope.statements.push(node);
//   return lineIndex + 1;
// };
