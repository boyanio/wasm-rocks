import { parse, AssignmentNode } from "../../../src/rockstar/parser";

describe("rockstar", () => {
  describe("parse", () => {
    describe("variables", () => {
      const cases = {
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
        ],

        "variable assignment": [
          ["Put 5 into X", "x", "5"],
          ['Put "Hello San Francisco" into the message', "the message", '"Hello San Francisco"'],
          ["Let my balance be 1000000", "my balance", "1000000"],
          [
            "Let the survivors be the brave without the fallen",
            "the survivors",
            'subtract(var("the brave"), var("the fallen"))'
          ],
          ["Put here minus there into my hands", "my hands", 'subtract(var("here"), var("there"))'],
          ["Put here plus there into my hands", "my hands", 'add(var("here"), var("there"))'],
          ["Put here with there into my hands", "my hands", 'add(var("here"), var("there"))'],
          ["Put the whole of your heart into my hands", "my hands", 'multiply(var("the whole"), var("your heart"))'],
          ["Put here times there into my hands", "my hands", 'multiply(var("here"), var("there"))'],
          ["Put my heart over the moon into my hands", "my hands", 'divide(var("my heart"), var("the moon"))'],
          ["Let X be times 10", "x", 'multiply(var("x"), 10)'],
          ["Let X be of 10", "x", 'multiply(var("x"), 10)'],
          ["Let X be with 10", "x", 'add(var("x"), 10)'],
          ["Let X be plus 10", "x", 'add(var("x"), 10)'],
          ["Let the children be minus fear", "the children", 'subtract(var("the children"), var("fear"))'],
          ["Let the children be without fear", "the children", 'subtract(var("the children"), var("fear"))'],
          ["Let my heart be over the moon", "my heart", 'divide(var("my heart"), var("the moon"))']
        ]
      };
      for (const caseName of Object.keys(cases)) {
        describe(caseName, () => {
          for (const [input, name, expression] of cases[caseName]) {
            it(`${input} => ${name} = ${expression}`, () => {
              const ast = parse(input as string);

              expect(ast.length).toEqual(1);
              expect(ast[0].type).toEqual("assignment");

              const node = ast[0] as AssignmentNode;
              expect(node.name).toEqual(name);
              expect(node.expression.toString()).toEqual(expression);
            });
          }
        });
      }
    });
  });
});
