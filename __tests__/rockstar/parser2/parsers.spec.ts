import {
  string,
  whitespace,
  anyWord,
  map,
  zeroOrMany
} from "../../../src/rockstar/parser2/parsers";
import { isParseError, Context } from "../../../src/rockstar/parser2/types";

describe("rockstar", () => {
  describe("parsing2", () => {
    describe("string", () => {
      it("parses a string from the beginning", () => {
        const parser = string("hello");
        const context: Context = { lineIndex: 0, offset: 0 };
        const parsed = parser("hello, world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toEqual("hello");
        expect(context.offset).toEqual(5);
      });

      it("parses a string from a certain the offset", () => {
        const parser = string("ll");
        const context: Context = { lineIndex: 0, offset: 2 };
        const parsed = parser("hello, world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toEqual("ll");
        expect(context.offset).toEqual(4);
      });

      it("returns error if string cannot be parsed", () => {
        const parser = string("abc");
        const context: Context = { lineIndex: 0, offset: 0 };
        const parsed = parser("hello, world", context);

        expect(isParseError(parsed)).toBeTruthy();
        expect(context.offset).toEqual(0);
      });
    });

    describe("whitespace", () => {
      it("parses single whitespace from the beginning", () => {
        const parser = whitespace();
        const context: Context = { lineIndex: 0, offset: 0 };
        const parsed = parser(" hello, world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toBeNull();
        expect(context.offset).toEqual(1);
      });

      it("parses single whitespace from a certain offset", () => {
        const parser = whitespace();
        const context: Context = { lineIndex: 0, offset: 6 };
        const parsed = parser("hello, world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toBeNull();
        expect(context.offset).toEqual(7);
      });

      it("parses multiple whitespace and updates the offset", () => {
        const parser = whitespace();
        const context: Context = { lineIndex: 0, offset: 0 };
        const parsed = parser("   hello, world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toBeNull();
        expect(context.offset).toEqual(3);
      });

      it("parses optional whitespace", () => {
        const parser = whitespace(true);
        const context: Context = { lineIndex: 0, offset: 0 };
        const parsed = parser("hello, world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toBeNull();
        expect(context.offset).toEqual(0);
      });

      it("returns error if whitespace cannot be parsed", () => {
        const parser = whitespace();
        const context: Context = { lineIndex: 0, offset: 0 };
        const parsed = parser("hello, world", context);

        expect(isParseError(parsed)).toBeTruthy();
        expect(context.offset).toEqual(0);
      });
    });

    describe("anyWord", () => {
      it("parses a word, followed by whitespace", () => {
        const parser = anyWord("hello");
        const context: Context = { lineIndex: 0, offset: 0 };
        const parsed = parser("hello world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toEqual("hello");
        expect(context.offset).toEqual(6);
      });

      it("parses a word at the end of the source", () => {
        const parser = anyWord("world");
        const context: Context = { lineIndex: 0, offset: 6 };
        const parsed = parser("hello world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toEqual("world");
        expect(context.offset).toEqual(11);
      });

      it("parses a word from many words", () => {
        const parser = anyWord("abc", "my");
        const context: Context = { lineIndex: 0, offset: 6 };
        const parsed = parser("hello my world", context);

        expect(isParseError(parsed)).toBeFalsy();
        expect(parsed).toEqual("my");
        expect(context.offset).toEqual(9);
      });
    });
  });

  describe("map", () => {
    it("maps results of a parser", () => {
      const parser = map(x => x.length, string("hello"));
      const context: Context = { lineIndex: 0, offset: 0 };
      const parsed = parser("hello world", context);

      expect(isParseError(parsed)).toBeFalsy();
      expect(parsed).toEqual(5);
      expect(context.offset).toEqual(6);
    });

    it("returns error if the parser returns error", () => {
      const parser = map(x => x.length, string("abc"));
      const context: Context = { lineIndex: 0, offset: 0 };
      const parsed = parser("hello world", context);

      expect(isParseError(parsed)).toBeTruthy();
      expect(context.offset).toEqual(0);
    });

    it("creates parse error within the map function", () => {
      const parser = map((x, toParseError) => toParseError("err"), string("hello"));
      const context: Context = { lineIndex: 0, offset: 0 };
      const parsed = parser("hello world", context);

      expect(isParseError(parsed)).toBeTruthy();
      expect(context.offset).toEqual(0);
    });
  });

  describe("zeroOrMany", () => {
    it("parses zero repetitions", () => {
      const parser = zeroOrMany(string("a"));
      const context: Context = { lineIndex: 0, offset: 0 };
      const parsed = parser("bbb", context);

      expect(isParseError(parsed)).toBeFalsy();
      expect(parsed).toEqual([]);
      expect(context.offset).toEqual(0);
    });

    it("parses single repetition", () => {
      const parser = zeroOrMany(string("a"));
      const context: Context = { lineIndex: 0, offset: 0 };
      const parsed = parser("abbb", context);

      expect(isParseError(parsed)).toBeFalsy();
      expect(parsed).toEqual(["a"]);
      expect(context.offset).toEqual(1);
    });

    it("parses multiple repetitions", () => {
      const parser = zeroOrMany(string("a"));
      const context: Context = { lineIndex: 0, offset: 0 };
      const parsed = parser("aaabbb", context);

      expect(isParseError(parsed)).toBeFalsy();
      expect(parsed).toEqual(["a", "a", "a"]);
      expect(context.offset).toEqual(3);
    });
  });
});
