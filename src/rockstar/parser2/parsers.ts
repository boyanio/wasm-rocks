import { Parser, Context, ParseError, Parsed, isParseError, parseError } from "./types";

export const $1 = <T>(x: T): T => x;

export const $2 = <T>(_1: unknown, x: T): T => x;

/**
 * Runs a sequence of parsers until one of the fails. It keeps the
 * offset the failed parser. It maps the result based on the results
 * from all successfull parsers
 */
export const sequence = <T extends Array<any>, U>(
  map: (...args: { [I in keyof T]: T[I] }) => U,
  ...parsers: { [I in keyof T]: Parser<T[I]> }
): Parser<U> => (source: string, context: Context): Parsed<U> => {
  const values: unknown[] = [];
  for (const parser of parsers) {
    const result = parser(source, context);
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
): Parser<U> => (source: string, context: Context): Parsed<U> => {
  const values: unknown[] = [];
  const initialOffset = context.offset;

  for (const parser of parsers) {
    const result = parser(source, context);
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
  source: string,
  context: Context
): Parsed<T> => {
  const errors: ParseError[] = [];
  const initialOffset = context.offset;

  for (const parser of parsers) {
    const parsed = parser(source, context);
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
): Parser<T> => (source: string, context: Context): Parsed<T> => {
  const initialOffset = context.offset;
  const parsed = parser(source, context);
  if (isParseError(parsed)) return parsed as ParseError;

  const toParseError = (message: string): ParseError => {
    context.offset = initialOffset;
    return parseError(message, context);
  };
  return mapFn(parsed as S, toParseError);
};

/**
 * Parses an end of a string.
 */
export const end: Parser<null> = (source: string, context: Context): Parsed<null> =>
  source.length === context.offset ? null : parseError("Expected end of source", context);

export const string = (input: string): Parser<string> => (
  source: string,
  context: Context
): Parsed<string> => {
  if (!source.startsWith(input, context.offset)) {
    return parseError(`Expected string: ${input}`, context);
  }

  context.offset += input.length;
  return input;
};

/**
 * Matches the string against a RegExp pattern.
 */
export const pattern = (regexString: string, consume = true): Parser<string> => {
  const regexp = new RegExp(regexString, "y");

  return (source: string, context: Context): Parsed<string> => {
    regexp.lastIndex = context.offset;
    const result = regexp.exec(source);
    if (!result) return parseError(`Expected pattern: ${regexString}`, context);

    const parsed = result[0];
    if (consume) {
      context.offset += parsed.length;
    }
    return parsed;
  };
};

/**
 * Matches a strign against whitespace. The whitespace can be
 * required (default) or optional.
 */
export const whitespace = (optional = false): Parser<null> => (
  source: string,
  context: Context
): Parsed<null> => {
  const match = source.substring(context.offset).match(/^(\s+)/);
  if (!match && !optional) return parseError("Expected whitespace", context);

  if (match) {
    context.offset += match[1].length;
  }
  return null;
};

export const between = (start: string, end: string): Parser<string> => (
  source: string,
  context: Context
): Parsed<string> => {
  const input = source.substring(context.offset);

  if (!input.startsWith(start)) return parseError(`Expected start: ${start}`, context);

  const nextIndex = input.indexOf(end, start.length);
  if (nextIndex < 0) return parseError(`Expected end: ${end}`, context);

  const result = input.substring(start.length, nextIndex);
  context.offset += start.length + result.length + end.length;
  return result;
};

export const keysOf = <T>(obj: { [key: string]: T }): Parser<T> =>
  map((key: string) => obj[key], anyOf(...Object.keys(obj).map(key => string(key))));

export const anyWord = (...words: string[]): Parser<string> =>
  anyOf(...words.map(word => sequence($1, string(word), anyOf(whitespace(), end))));

export const drop = <T>(parser: Parser<T>): Parser<null> => map(() => null, parser);

export const zeroOrMany = <T>(parser: Parser<T>): Parser<T[]> => (
  source: string,
  context: Context
): Parsed<T[]> => {
  const items: T[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const initialOffset = context.offset;
    const result = parser(source, context);
    if (initialOffset === context.offset) break;
    if (isParseError(result)) return result as ParseError;

    items.push(result as T);
  }
  return items;
};

export const optional = <T>(parser: Parser<T>): Parser<T | null> => (
  source: string,
  context: Context
): Parsed<T | null> => {
  const initialOffset = context.offset;
  const result = parser(source, context);
  if (isParseError(result)) {
    context.offset = initialOffset;
    return null;
  }
  return result as T;
};
