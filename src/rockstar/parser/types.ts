export type Parsed<T> = T | ParseError;

export type ParseError = {
  type: "parseError";
  lineIndex: number;
  offset: number;
  message: string;
};

export type Context = {
  lineIndex: number;
  offset: number;
};

export type Parser<T> = (lines: string[], context: Context) => Parsed<T>;
