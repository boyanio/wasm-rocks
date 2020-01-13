import { Program } from "../ast";

export type Parser = (program: Program, lines: string[], lineIndex: number) => number;
