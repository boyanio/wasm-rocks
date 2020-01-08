import { parse, Assignment } from "../../../src/rockstar/parser";

type CaseArg = string | null;
type Cases = CaseArg[][];

describe("rockstar", () => {
  describe("parser", () => {
    describe("assignments", () => {
      const cases: Cases = [
        ["Put 5 into X", "x", "5"],
        ['Put "Hello San Francisco" into the message', "the message", '"Hello San Francisco"'],
        ["Let my balance be 1000000", "my balance", "1000000"],
        [
          "Let the survivors be the brave without the fallen",
          "the survivors",
          'var("the brave") - var("the fallen")'
        ],
        ["Put here minus there into my hands", "my hands", 'var("here") - var("there")'],
        ["Put here plus there into my hands", "my hands", 'var("here") + var("there")'],
        ["Put here with there into my hands", "my hands", 'var("here") + var("there")'],
        [
          "Put the whole of your heart into my hands",
          "my hands",
          'var("the whole") * var("your heart")'
        ],
        ["Put here times there into my hands", "my hands", 'var("here") * var("there")'],
        [
          "Put my heart over the moon into my hands",
          "my hands",
          'var("my heart") / var("the moon")'
        ],
        ["Let X be times 10", "x", "* 10"],
        ["Let X be of 10", "x", "* 10"],
        ["Let X be with 10", "x", "+ 10"],
        ["Let X be plus 10", "x", "+ 10"],
        ["Let the children be minus fear", "the children", '- var("fear")'],
        ["Let the children be without fear", "the children", '- var("fear")'],
        ["Let my heart be over the moon", "my heart", '/ var("the moon")']
      ];
      for (const [input, name, expression] of cases) {
        it(`${input} => ${name || "pronoun()"} = ${expression}`, () => {
          const ast = parse(input as string);

          expect(ast.length).toEqual(1);

          const node = ast[0] as Assignment;
          expect(node.type).toEqual("assignment");
          expect(node.target.toString()).toEqual(name ? `var("${name}")` : "pronoun()");
          expect(node.expression.toString()).toEqual(expression);
        });
      }
    });
  });
});
