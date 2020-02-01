import { countUnique, arrayEquals } from "../../src/utils/array-utils";

describe("utils", () => {
  describe("array utils", () => {
    describe("countUnique", () => {
      it("returns empty array for empty input", () => {
        const result = countUnique([]);
        expect(result).toEqual([]);
      });

      it("counts unique strings", () => {
        const result = countUnique(["a", "b", "a"]);
        expect(result).toEqual([
          ["a", 2],
          ["b", 1]
        ]);
      });

      it("counts unique integers", () => {
        const result = countUnique([4, 3, 3, 5]);
        expect(result).toEqual([
          [4, 1],
          [3, 2],
          [5, 1]
        ]);
      });

      it("counts objects by reference", () => {
        const obj1 = {};
        const obj2 = {};
        const result = countUnique([obj1, obj2, obj2]);
        expect(result).toEqual([
          [obj1, 1],
          [obj2, 2]
        ]);
      });
    });

    describe("arrayEquals", () => {
      it("equals two empty arrays", () => {
        const result = arrayEquals([], []);
        expect(result).toBeTruthy();
      });

      it("equals two number arrays", () => {
        const result = arrayEquals([1, 2], [1, 2]);
        expect(result).toBeTruthy();
      });

      it("equals two string arrays", () => {
        const result = arrayEquals(["a", "d"], ["a", "d"]);
        expect(result).toBeTruthy();
      });

      it("order matters", () => {
        const result = arrayEquals(["a", "d"], ["d", "a"]);
        expect(result).toBeFalsy();
      });
    });
  });
});
