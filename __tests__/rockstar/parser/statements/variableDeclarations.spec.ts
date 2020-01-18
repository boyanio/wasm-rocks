import { parse } from "../../../../src/rockstar/parser";
import { VariableDeclaration } from "../../../../src/rockstar/ast";

type Case = [string, string, string | number];
type Cases = { [caseName: string]: Case[] };

describe("rockstar", () => {
  describe("parser", () => {
    describe("variable declarations", () => {
      const cases: Cases = {
        "simple variable declaration": [
          ["Variable is 1", "variable", 1],
          ['Tommy was "a rockstar"', "tommy", "a rockstar"],
          ['Peters were "rockstars"', "peters", "rockstars"],
          ['Peters are "rockstars"', "peters", "rockstars"]
        ],

        "common variable declaration": [
          ["My boys were 5", "my boys", 5],
          ["A boy was 5", "a boy", 5],
          ['The lady is "very nice"', "the lady", "very nice"]
        ],

        "proper variable declaration": [
          ['Cool Lady is "very nice"', "Cool Lady", "very nice"],
          ["Doctor Feelgood is 10", "Doctor Feelgood", 10]
        ],

        "poetic literals": [
          ["Tommy says I am a rockstar", "tommy", "I am a rockstar"],
          ["Tommy is a rockstar", "tommy", 18],
          ["My dreams were ice. A life unfulfilled; wakin'", "my dreams", 3.1415],
          ["My dreams are ice-cold", "my dreams", 8]
        ]
      };
      for (const caseName of Object.keys(cases)) {
        describe(caseName, () => {
          for (const [source, variable, value] of cases[caseName]) {
            it(`${source} => ${variable} = ${value}`, () => {
              const { statements } = parse(source);

              expect(statements.length).toEqual(1);
              expect(statements[0].type).toEqual("variableDeclaration");

              const node = statements[0] as VariableDeclaration;
              expect(node.variable.name).toEqual(variable);

              const type = typeof value === "string" ? "string" : "number";
              expect(node.value).toEqual({ type, value });
            });
          }
        });
      }

      describe("constant literals", () => {
        it("Peter is mysterious", () => {
          const { statements } = parse("Peter is mysterious");

          expect(statements.length).toEqual(1);
          expect(statements[0].type).toEqual("variableDeclaration");

          const node = statements[0] as VariableDeclaration;
          expect(node.variable.name).toEqual("peter");
          expect(node.value).toEqual({ type: "mysterious" });
        });

        for (const nullValue of ["null", "nowhere", "empty", "nobody", "gone", "nothing"]) {
          it(`Peter is ${nullValue}`, () => {
            const { statements } = parse(`Peter is ${nullValue}`);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("variableDeclaration");

            const node = statements[0] as VariableDeclaration;
            expect(node.variable.name).toEqual("peter");
            expect(node.value).toEqual({ type: "null" });
          });
        }

        for (const trueValue of ["true", "right", "yes"]) {
          it(`Peter is ${trueValue}`, () => {
            const { statements } = parse(`Peter is ${trueValue}`);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("variableDeclaration");

            const node = statements[0] as VariableDeclaration;
            expect(node.variable.name).toEqual("peter");
            expect(node.value).toEqual({ type: "boolean", value: true });
          });
        }

        for (const falseValue of ["false", "wrong", "no", "lies"]) {
          it(`Peter is ${falseValue}`, () => {
            const { statements } = parse(`Peter is ${falseValue}`);

            expect(statements.length).toEqual(1);
            expect(statements[0].type).toEqual("variableDeclaration");

            const node = statements[0] as VariableDeclaration;
            expect(node.variable.name).toEqual("peter");
            expect(node.value).toEqual({ type: "boolean", value: false });
          });
        }
      });
    });
  });
});
