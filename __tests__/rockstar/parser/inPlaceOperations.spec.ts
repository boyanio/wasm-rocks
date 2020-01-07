import { parse, InPlaceOperation } from "../../../src/rockstar/parser";

type CaseArg = string | number | null;
type Cases = { [key: string]: CaseArg[][] };

describe("rockstar", () => {
  describe("parser", () => {
    describe("in-place operations", () => {
      const cases: Cases = {
        "increment / decrement": [
          ["Build my world up", "buildUp", 'var("my world")', 1],
          ["Build my world up, up", "buildUp", 'var("my world")', 2],
          ["Build my world up up", "buildUp", 'var("my world")', 2],
          ["Knock the walls down", "knockDown", 'var("the walls")', 1],
          ["Knock the walls down, down", "knockDown", 'var("the walls")', 2],
          ["Knock the walls down down", "knockDown", 'var("the walls")', 2]
        ],

        rounding: [
          ["Turn up X", "turnUp", 'var("x")', 1],
          ["Turn down X", "turnDown", 'var("x")', 1],
          ["Turn round X", "turnRound", 'var("x")', 1],
          ["Turn around X", "turnRound", 'var("x")', 1],
          ["Turn it up.", "turnUp", "pronoun()", 1],
          ["Turn her around.", "turnRound", "pronoun()", 1],
          ["Turn them down.", "turnDown", "pronoun()", 1]
        ]
      };
      for (const caseName of Object.keys(cases)) {
        describe(caseName, () => {
          for (const [input, operationType, identifier, times] of cases[caseName]) {
            it(`${input} => ${times} x ${operationType}(${identifier})`, () => {
              const ast = parse(input as string);

              expect(ast.length).toEqual(times);

              // all are equal
              expect(new Set<string>(ast.map(x => x.toString())).size).toEqual(1);

              const node = ast[0] as InPlaceOperation;
              expect(node.type).toEqual("inPlace");
              expect(node.target.toString()).toEqual(identifier);
              expect(node.operationType).toEqual(operationType);
            });
          }
        });
      }
    });
  });
});
