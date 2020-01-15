import { splitOnce } from "../../src/utils/string-utils";

describe("utils", () => {
  describe("string utils", () => {
    describe("splitOnce", () => {
      it("splits a string into two parts based on single-character separator", () => {
        const [first, rest] = splitOnce("abc", "b");
        expect(first).toEqual("a");
        expect(rest).toEqual("c");
      });

      it("splits a string into two parts based on multi-character separator", () => {
        const [first, rest] = splitOnce("abcd", "bc");
        expect(first).toEqual("a");
        expect(rest).toEqual("d");
      });

      it("returns the whole string as first result when the string does not contain the separator", () => {
        const [first, rest] = splitOnce("abc", "d");
        expect(first).toEqual("abc");
        expect(rest).toEqual("");
      });

      it("returns the whole string as rest result when the separator is the empty string", () => {
        const [first, rest] = splitOnce("abc", "");
        expect(first).toEqual("");
        expect(rest).toEqual("abc");
      });
    });
  });
});
