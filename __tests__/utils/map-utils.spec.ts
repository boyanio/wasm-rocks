import { getOrThrow } from "../../src/utils/map-utils";

describe("utils", () => {
  describe("map utils", () => {
    describe("getOrThrow", () => {
      it("throws when an item does not exist in the map", () => {
        const map = new Map<string, number>();
        expect(() => getOrThrow(map, "abc", "err")).toThrowError("err");
      });

      it("gets an item from the map when it exists", () => {
        const map = new Map<string, number>([["abc", 5]]);
        expect(getOrThrow(map, "abc", "err")).toEqual(5);
      });
    });
  });
});
