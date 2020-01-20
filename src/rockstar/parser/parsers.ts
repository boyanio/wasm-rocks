import { Parser, Context, ParseError, Parsed } from "./types";

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

export const lineIndexWithinBounds = <T>(parser: Parser<T>): Parser<T> => (
  lines: string[],
  context: Context
): Parsed<T> => {
  if (context.lineIndex < 0 || context.lineIndex >= lines.length)
    return parseError(`Invalid line: ${context.lineIndex}`, context);

  return parser(lines, context);
};

export const $1 = <T>(x: T): T => x;

export const $2 = <T>(_1: unknown, x: T): T => x;

export const $3 = <T>(_1: unknown, _2: unknown, x: T): T => x;

/**
 * Runs a sequence of parsers until one of the fails. It keeps the
 * offset the failed parser. It maps the result based on the results
 * from all successfull parsers
 */
export const sequence = <T extends Array<unknown>, U>(
  map: (...args: { [I in keyof T]: T[I] }) => U,
  ...parsers: { [I in keyof T]: Parser<T[I]> }
): Parser<U> => (lines: string[], context: Context): Parsed<U> => {
  const values: unknown[] = [];
  for (const parser of parsers) {
    const result = parser(lines, context);
    if (isParseError(result)) return result as ParseError;

    values.push(result);
  }

  // eslint-disable-next-line prefer-spread
  return map.apply(null, values as { [I in keyof T]: T[I] });
};

/**
 * Runs a sequence of parsers as batch: either all of them succeed
 * or they fail together. In case of failure, the offset is reset to
 * the initial one. It maps the result based on the results
 * from all the parsers.
 */
export const batch = <T extends Array<unknown>, U>(
  map: (...args: { [I in keyof T]: T[I] }) => U,
  ...parsers: { [I in keyof T]: Parser<T[I]> }
): Parser<U> => (lines: string[], context: Context): Parsed<U> => {
  const values: unknown[] = [];
  const initialOffset = context.offset;

  for (const parser of parsers) {
    const result = parser(lines, context);
    if (isParseError(result)) {
      context.offset = initialOffset;
      return result as ParseError;
    }

    values.push(result);
  }

  // eslint-disable-next-line prefer-spread
  return map.apply(null, values as { [I in keyof T]: T[I] });
};

/**
 * Returns the result of the first succeeded parser.
 */
export const anyOf = <T>(...parsers: Parser<T>[]): Parser<T> => (
  lines: string[],
  context: Context
): Parsed<T> => {
  const errors: ParseError[] = [];
  const initialOffset = context.offset;

  for (const parser of parsers) {
    const parsed = parser(lines, context);
    if (!isParseError(parsed)) return parsed;

    if (initialOffset === context.offset) {
      errors.push(parsed as ParseError);
    } else {
      return parsed;
    }
  }

  return parseError(`Expected any of: ${errors.map(e => e.message).join(", ")}`, context);
};

/**
 * Runs a parser and maps its result to something else.
 */
export const map = <S, T>(
  mapFn: (a: S, toParseError: (message: string) => ParseError) => Parsed<T>,
  parser: Parser<S>
): Parser<T> => (lines: string[], context: Context): Parsed<T> => {
  const initialOffset = context.offset;
  const parsed = parser(lines, context);
  if (isParseError(parsed)) return parsed as ParseError;

  const toParseError = (message: string): ParseError => {
    context.offset = initialOffset;
    return parseError(message, context);
  };
  return mapFn(parsed as S, toParseError);
};

/**
 * Parses an end of the line.
 */
export const endOfLine: Parser<null> = lineIndexWithinBounds(
  (lines: string[], context: Context): Parsed<null> =>
    lines[context.lineIndex].length === context.offset
      ? null
      : parseError("Expected end of line", context)
);

/**
 * Matches the string with a specified one.
 */
export const string = (input: string): Parser<string> =>
  lineIndexWithinBounds(
    (lines: string[], context: Context): Parsed<string> => {
      if (!lines[context.lineIndex].startsWith(input, context.offset))
        return parseError(`Expected string: ${input}`, context);

      context.offset += input.length;
      return input;
    }
  );

/**
 * Matches the string against a RegExp pattern.
 */
export const pattern = (regexString: string, consume = true): Parser<string> => {
  const regexp = new RegExp(regexString, "y");

  return lineIndexWithinBounds(
    (lines: string[], context: Context): Parsed<string> => {
      regexp.lastIndex = context.offset;
      const result = regexp.exec(lines[context.lineIndex]);
      if (!result) return parseError(`Expected pattern: ${regexString}`, context);

      const parsed = result[0];
      if (consume) {
        context.offset += parsed.length;
      }
      return parsed;
    }
  );
};

/**
 * Matches a string against whitespace.
 */
export const whitespace: Parser<null> = lineIndexWithinBounds(
  (lines: string[], context: Context): Parsed<null> => {
    const match = lines[context.lineIndex].substring(context.offset).match(/^(\s+)/);
    if (!match) return parseError("Expected whitespace", context);

    if (match) {
      context.offset += match[1].length;
    }
    return null;
  }
);

/**
 * Matches a string against a surrounded one with a certain start and
 * end delimiters.
 */
export const between = (start: string, end: string): Parser<string> =>
  lineIndexWithinBounds(
    (lines: string[], context: Context): Parsed<string> => {
      const input = lines[context.lineIndex].substring(context.offset);
      if (!input.startsWith(start)) return parseError(`Expected start: ${start}`, context);

      const nextIndex = input.indexOf(end, start.length);
      if (nextIndex < 0) return parseError(`Expected end: ${end}`, context);

      const result = input.substring(start.length, nextIndex);
      context.offset += start.length + result.length + end.length;
      return result;
    }
  );

/**
 * Drops the result of a parser
 */
export const drop = <T>(parser: Parser<T>): Parser<null> => map(() => null, parser);

/**
 * Matches punctuation, whitespace or end of the line
 */
export const punctuation: Parser<null> = drop(
  anyOf(pattern("[.,!?:;]+\\s*"), whitespace, endOfLine)
);

/**
 * Matches against word, followed by punctuation.
 */
export const word = (w: string): Parser<string> => batch($1, string(w), punctuation);

/**
 * Matches against a sequence of words, each followed by punctuation.
 */
export const wordSequence = (...words: string[]): Parser<string> =>
  batch((...parsedWords) => parsedWords.join(" "), ...words.map(w => word(w)));

/**
 * Matchs against a list of words.
 */
export const anyWord = (...words: string[]): Parser<string> => anyOf(...words.map(w => word(w)));

/**
 * Matches against the keys of an object and maps the result
 * to the corresponding value.
 */
export const keysOf = <T>(obj: { [key: string]: T }): Parser<T> =>
  map((key: string) => obj[key], anyWord(...Object.keys(obj)));

/**
 * Matches zero or many times.
 */
export const zeroOrMany = <T>(parser: Parser<T>): Parser<T[]> => (
  lines: string[],
  context: Context
): Parsed<T[]> => {
  const items: T[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const initialLineIndex = context.lineIndex;
    const initialOffset = context.offset;
    const result = parser(lines, context);
    if (initialOffset === context.offset && initialLineIndex === context.lineIndex) break;

    if (isParseError(result)) return result as ParseError;

    items.push(result as T);
  }
  return items;
};

/**
 * Matches one or many times.
 */
export const oneOrMany = <T>(parser: Parser<T>): Parser<T[]> => (
  lines: string[],
  context: Context
): Parsed<T[]> => {
  const items: T[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const initialOffset = context.offset;
    const initialLineIndex = context.lineIndex;
    const result = parser(lines, context);

    if (
      initialOffset === context.offset &&
      initialLineIndex === context.lineIndex &&
      items.length > 0
    )
      break;
    if (isParseError(result)) return result as ParseError;

    items.push(result as T);
  }
  return items;
};

/**
 * Makes the inner parser optional in case it returns error.
 */
export const optional = <T>(parser: Parser<T>): Parser<T | null> => (
  lines: string[],
  context: Context
): Parsed<T | null> => {
  const initialOffset = context.offset;
  const result = parser(lines, context);
  if (isParseError(result)) {
    context.offset = initialOffset;
    return null;
  }
  return result as T;
};

/**
 * Increases the line number in the context
 */
export const toNextLine = <T>(parser: Parser<T>): Parser<T> => (
  lines: string[],
  context: Context
): Parsed<T> => {
  const result = parser(lines, context);
  if (!isParseError(result)) {
    context.lineIndex++;
    context.offset = 0;
  }
  return result;
};

/**
 * Matches an empty line.
 */
export const emptyLine: Parser<null> = drop(sequence($1, optional(whitespace), endOfLine));
