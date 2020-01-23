import { parse } from "../../../src/rockstar/parser";

describe("rockstar", () => {
  describe("parser", () => {
    describe("parse", () => {
      it("parses variable declaration statements separated by a blank line", () => {
        const source = `
        My desire is cool

        Fire is ice
        `;
        const program = parse(source);

        expect(program).toBeTruthy();
      });
    });
  });
});
