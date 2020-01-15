export type Parsed<T> = T | ParseError;

export type ParseError = {
  type: "parseError";
  lineIndex: number;
  offset: number;
  message: string;
};

export const parseError = (message: string, context: Context): ParseError => ({
  type: "parseError",
  offset: context.offset,
  lineIndex: context.lineIndex,
  message
});

export const isParseError = <T>(parsed: Parsed<T>): boolean =>
  parsed != null &&
  typeof parsed === "object" &&
  "type" in parsed &&
  parsed["type"] === "parseError";

export type Context = {
  lineIndex: number;
  offset: number;
};

export type Parser<T> = (source: string, context: Context) => Parsed<T>;
