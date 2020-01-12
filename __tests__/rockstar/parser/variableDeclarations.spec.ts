import { parse, VariableDeclaration } from "../../../src/rockstar/parser";

type Cases = { [key: string]: string[][] };

describe("rockstar", () => {
  describe("parser", () => {
    describe("variable declarations", () => {
      const cases: Cases = {
        "simple variable declaration": [
          ["Variable is 1", "variable", "1"],
          ['Tommy was "a rockstar"', "tommy", '"a rockstar"'],
          ['Peters were "rockstars"', "peters", '"rockstars"'],
          ['Peters are "rockstars"', "peters", '"rockstars"']
        ],

        "common variable declaration": [
          ["My boys were 5", "my boys", "5"],
          ["A boy was 5", "a boy", "5"],
          ["YoUr boy is 5", "your boy", "5"],
          ["aN applE is 5", "an apple", "5"],
          ['The lady is "very nice"', "the lady", '"very nice"']
        ],

        "proper variable declaration": [
          ['COOL LadY is "very nice"', "Cool Lady", '"very nice"'],
          ["Doctor Feelgood is 10", "Doctor Feelgood", "10"]
        ],

        "constant literals": [
          ["Peter is mysterious", "peter", "mysterious"],
          ["Peter is null", "peter", "null"],
          ["Peter is nobody", "peter", "null"],
          ["Peter is nowhere", "peter", "null"],
          ["Peter is empty", "peter", "null"],
          ["Peter is gone", "peter", "null"],
          ["Peter is nothing", "peter", "null"],
          ["Peter is true", "peter", "true"],
          ["Peter is right", "peter", "true"],
          ["Peter is yes", "peter", "true"],
          ["Peter is false", "peter", "false"],
          ["Peter is wrong", "peter", "false"],
          ["Peter is no", "peter", "false"],
          ["Peter is lies", "peter", "false"]
        ],

        "poetic literals": [
          ["Tommy says I am a rockstar", "tommy", '"I am a rockstar"'],
          ["Tommy is a rockstar", "tommy", "18"],
          ["My dreams were ice. A life unfulfilled; wakin'", "my dreams", "3.1415"],
          ["My dreams are ice-cold", "my dreams", "8"]
        ]
      };
      for (const caseName of Object.keys(cases)) {
        describe(caseName, () => {
          for (const [input, variable, literal] of cases[caseName]) {
            it(`${input} => ${variable} = ${literal}`, () => {
              const ast = parse(input);

              expect(ast.length).toEqual(1);

              const node = ast[0] as VariableDeclaration;
              expect(node.type).toEqual("variableDeclaration");
              expect(node.variable.name).toEqual(variable);
              expect(node.value.toString()).toEqual(literal);
            });
          }
        });
      }
    });
  });
});
