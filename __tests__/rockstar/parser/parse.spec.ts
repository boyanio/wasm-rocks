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

      it("parses loop with if statement inside", () => {
        const source = `
        Number is 1
        Divisor is 2
        While Number is as high as Divisor
        If Number is 0
        Say "Buzz!"
        
        Say 5
        `;
        const program = parse(source);

        // 1. variable declaration
        // 2. variable declaration
        // 3. loop
        expect(program.statements.length).toEqual(3);
        expect(program.statements[2].type).toEqual("loop");
      });
    });
  });
});
