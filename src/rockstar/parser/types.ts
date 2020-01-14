import { Scope } from "../ast";

export type Parser = (scope: Scope, lines: string[], lineIndex: number) => number;
