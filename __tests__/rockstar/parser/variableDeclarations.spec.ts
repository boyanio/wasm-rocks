import { parse } from "../../../src/rockstar/parser";
import {
  VariableDeclaration,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral
} from "../../../src/rockstar/ast";

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
          ["YoUr boy is 5", "your boy", 5],
          ["aN applE is 5", "an apple", 5],
          ['The lady is "very nice"', "the lady", "very nice"]
        ],

        "proper variable declaration": [
          ['COOL LadY is "very nice"', "Cool Lady", "very nice"],
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
          for (const [input, variable, literal] of cases[caseName]) {
            it(`${input} => ${variable} = ${literal}`, () => {
              const ast = parse(input);

              expect(ast.length).toEqual(1);
              expect(ast[0].type).toEqual("variableDeclaration");

              const node = ast[0] as VariableDeclaration;
              expect(node.variable.name).toEqual(variable);

              if (typeof literal === "string") {
                expect((node.value as StringLiteral).value).toEqual(literal);
              } else {
                expect((node.value as NumberLiteral).value).toEqual(literal);
              }
            });
          }
        });
      }

      describe("constant literals", () => {
        it("Peter is mysterious", () => {
          const ast = parse("Peter is mysterious");

          expect(ast.length).toEqual(1);
          expect(ast[0].type).toEqual("variableDeclaration");

          const node = ast[0] as VariableDeclaration;
          expect(node.variable.name).toEqual("peter");
          expect(node.value.type).toEqual("mysterious");
        });

        for (const nullValue of ["null", "nowhere", "empty", "nobody", "gone", "nothing"]) {
          it(`Peter is ${nullValue}`, () => {
            const ast = parse(`Peter is ${nullValue}`);

            expect(ast.length).toEqual(1);
            expect(ast[0].type).toEqual("variableDeclaration");

            const node = ast[0] as VariableDeclaration;
            expect(node.variable.name).toEqual("peter");
            expect(node.value.type).toEqual("null");
          });
        }

        for (const trueValue of ["true", "right", "yes"]) {
          it(`Peter is ${trueValue}`, () => {
            const ast = parse(`Peter is ${trueValue}`);

            expect(ast.length).toEqual(1);
            expect(ast[0].type).toEqual("variableDeclaration");

            const node = ast[0] as VariableDeclaration;
            expect(node.variable.name).toEqual("peter");
            expect(node.value.type).toEqual("boolean");
            expect((node.value as BooleanLiteral).value === true).toBeTruthy();
          });
        }

        for (const falseValue of ["false", "wrong", "no", "lies"]) {
          it(`Peter is ${falseValue}`, () => {
            const ast = parse(`Peter is ${falseValue}`);

            expect(ast.length).toEqual(1);
            expect(ast[0].type).toEqual("variableDeclaration");

            const node = ast[0] as VariableDeclaration;
            expect(node.variable.name).toEqual("peter");
            expect(node.value.type).toEqual("boolean");
            expect((node.value as BooleanLiteral).value === false).toBeTruthy();
          });
        }
      });
    });
  });
});
