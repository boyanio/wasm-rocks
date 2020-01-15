import {
  identifier,
  pronoun,
  mysteriousLiteral,
  nullLiteral,
  booleanLiteral,
  stringLiteral,
  numberLiteral,
  arithmeticExpression,
  functionCall
} from "../../../src/rockstar/parser2/parseExpression";
import { Parser, Context, isParseError } from "../../../src/rockstar/parser2/types";

type Case = [string, string, boolean, unknown, number];
type CaseGroup = {
  title: string;
  parser: Parser<unknown>;
  cases: Case[];
};

const caseGroups: CaseGroup[] = [
  {
    title: "identifiers",
    parser: identifier,
    cases: [
      ["parses simple variable name starting with a lowercase letter", "dog", false, "dog", 3],
      ["parses simple variable name starting with an uppercase letter", "Dog", false, "dog", 3],
      [
        "does not parse simple variable name containing an uppercase letter after the first letter",
        "dOg",
        true,
        null,
        0
      ],
      [
        "parses simple variable name starting followed by a non-alphanumeric char",
        "dog,",
        false,
        "dog",
        3
      ],
      ["parses simple variable name from a single letter", "D", false, "d", 1],
      ["does not parse simple variable name of a keyword", "Your", true, null, 0],
      ["parses simple variable name partially", "dog is very cool", false, "dog", 4],
      [
        "parses common variable name starting with a lowercase letter",
        "my dog",
        false,
        "my dog",
        6
      ],
      [
        "parses common variable name starting with an uppercase letter",
        "My dog",
        false,
        "my dog",
        6
      ],
      [
        "does not parse common variable name containing an uppercase letter after the first letter",
        "my dOg",
        true,
        null,
        0
      ],
      ["parses common variable name partially", "my dog cat", false, "my dog", 7],
      ["parses common variable followed by a non-alphanumeric char", "my dog.", false, "my dog", 6],
      [
        "does not parse common variable name when the second word is a keyword",
        "my nobody",
        true,
        null,
        0
      ],
      [
        "does not parse proper variable name when it starts similarly to a common one",
        "My Dog",
        true,
        null,
        0
      ],
      ["parses proper variable name", "Myy Dog", false, "Myy Dog", 7],
      ["parses proper variable name partially", "Myy Dog is cool", false, "Myy Dog", 8],
      [
        "parses proper variable followed by a non-alphanumeric char",
        "Myy Dog!",
        false,
        "Myy Dog",
        7
      ],
      [
        "does not proper variable name containing an uppercase letter after the first letter in one of the words",
        "MYy DoG",
        true,
        null,
        0
      ]
    ]
  },
  {
    title: "pronouns",
    parser: pronoun,
    cases: [
      ["parses pronoun", "her", false, { type: "pronoun" }, 3],
      ["parses pronoun partially", "them bla", false, { type: "pronoun" }, 5],
      ["pronouns are case-sensitive", "Them", true, null, 0],
      ["does not parse pronoun", "bla bla", true, null, 0]
    ]
  },
  {
    title: "mysterious literals",
    parser: mysteriousLiteral,
    cases: [
      ["parses mysterious", "mysterious", false, { type: "mysterious" }, 10],
      ["mysterious is case-sensitive", "mYsterious", true, null, 0],
      ["parses mysterious partially", "mysterious is cool", false, { type: "mysterious" }, 11]
    ]
  },
  {
    title: "null literals",
    parser: nullLiteral,
    cases: [
      ["parses null as null", "null", false, { type: "null" }, 4],
      ["parses null as nobody", "nobody", false, { type: "null" }, 6],
      ["parses null as gone", "gone", false, { type: "null" }, 4],
      ["parses null as empty", "empty", false, { type: "null" }, 5],
      ["parses null as nothing", "nothing", false, { type: "null" }, 7],
      ["parses null as nowhere", "nowhere", false, { type: "null" }, 7],
      ["null is case-sensitive", "nUll", true, null, 0],
      ["parses null partially", "nobody is cool", false, { type: "null" }, 7]
    ]
  },
  {
    title: "boolean literals",
    parser: booleanLiteral,
    cases: [
      ["parses true as true", "true", false, { type: "boolean", value: true }, 4],
      ["parses true as right", "right", false, { type: "boolean", value: true }, 5],
      ["parses true as yes", "yes", false, { type: "boolean", value: true }, 3],
      ["parses false as false", "false", false, { type: "boolean", value: false }, 5],
      ["parses false as wrong", "wrong", false, { type: "boolean", value: false }, 5],
      ["parses false as no", "no", false, { type: "boolean", value: false }, 2],
      ["parses false as lies", "lies", false, { type: "boolean", value: false }, 4],
      ["boolean is case-sensitive", "tRue", true, null, 0],
      ["parses boolean partially", "yes it is cool", false, { type: "boolean", value: true }, 4]
    ]
  },
  {
    title: "string literals",
    parser: stringLiteral,
    cases: [
      ["parses string", '"Hello there"', false, { type: "string", value: "Hello there" }, 13],
      [
        "parses string partially",
        '"Hello there" or come back',
        false,
        { type: "string", value: "Hello there" },
        14
      ],
      ["parses empty string", '""', false, { type: "string", value: "" }, 2],
      ["does not parse string without a starting double quote", 'Hello" there', true, null, 0],
      [
        "does not parse string without matching closing double quote",
        '"Hello there',
        true,
        null,
        0
      ],
      ["does not parse string with a double quote", '"', true, null, 0]
    ]
  },
  {
    title: "number literals",
    parser: numberLiteral,
    cases: [
      ["parses integer", "123", false, { type: "number", value: 123 }, 3],
      ["parses floating-point number", "123.456", false, { type: "number", value: 123.456 }, 7],
      ["parses number partially", "123.456 987", false, { type: "number", value: 123.456 }, 8],
      [
        "does not parse number if the input starts with a non-numerical character",
        "x123 s",
        true,
        null,
        0
      ],
      ["does not parse number if it is not separated by whitespace", "123x", true, null, 0]
    ]
  },
  {
    title: "arithmetic expressions",
    parser: arithmeticExpression,
    cases: [
      [
        "the brave without the fallen",
        "the brave without the fallen",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "the brave" },
          right: { type: "variable", name: "the fallen" },
          operator: "subtract"
        },
        28
      ],
      [
        "here minus there",
        "here minus there",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "subtract"
        },
        16
      ],
      [
        "here minus there and some other stuff",
        "here minus there and some other stuff",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "subtract"
        },
        17
      ],
      [
        "here plus there",
        "here plus there",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "add"
        },
        15
      ],
      [
        "here with there",
        "here with there",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "add"
        },
        15
      ],
      [
        "here of there",
        "here of there",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "multiply"
        },
        13
      ],
      [
        "here times there",
        "here times there",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "multiply"
        },
        16
      ],
      [
        "here over there",
        "here over there",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "divide"
        },
        15
      ],
      [
        "here over 5",
        "here over 5",
        false,
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "number", value: 5 },
          operator: "divide"
        },
        11
      ],
      [
        '"hello" over 5',
        '"hello" over 5',
        false,
        {
          type: "arithmeticExpression",
          left: { type: "string", value: "hello" },
          right: { type: "number", value: 5 },
          operator: "divide"
        },
        14
      ]
    ]
  },
  {
    title: "function calls",
    parser: functionCall,
    cases: [
      [
        "Multiply taking the cat",
        "Multiply taking the cat",
        false,
        {
          type: "call",
          name: "multiply",
          args: [{ type: "variable", name: "the cat" }]
        },
        23
      ],
      [
        'Multiply taking "yo yo"',
        'Multiply taking "yo yo"',
        false,
        {
          type: "call",
          name: "multiply",
          args: [{ type: "string", value: "yo yo" }]
        },
        23
      ],
      [
        "Multiply taking 5",
        "Multiply taking 5",
        false,
        {
          type: "call",
          name: "multiply",
          args: [{ type: "number", value: 5 }]
        },
        17
      ],
      [
        "Multiply taking 5 'n' cool",
        "Multiply taking 5 'n' cool",
        false,
        {
          type: "call",
          name: "multiply",
          args: [
            { type: "number", value: 5 },
            { type: "variable", name: "cool" }
          ]
        },
        26
      ],
      [
        "Multiply taking cool and cool",
        "Multiply taking cool and cool",
        false,
        {
          type: "call",
          name: "multiply",
          args: [
            { type: "variable", name: "cool" },
            { type: "variable", name: "cool" }
          ]
        },
        29
      ],
      [
        'Multiply taking cool, "ya"',
        'Multiply taking cool, "ya"',
        false,
        {
          type: "call",
          name: "multiply",
          args: [
            { type: "variable", name: "cool" },
            { type: "string", value: "ya" }
          ]
        },
        26
      ]
    ]
  }
  // {
  //   title: "conditions",
  //   parser: parseCondition2,
  //   cases: [
  //     [
  //       "Tommy is nobody",
  //       "Tommy is nobody",
  //       {
  //         type: "comparisonCondition",
  //         operator: "equals",
  //         left: { type: "variable", name: "tommy" },
  //         right: { type: "null" }
  //       },
  //       ""
  //     ],
  //     [
  //       "not Tommy",
  //       "not Tommy",
  //       {
  //         type: "logicalNotCondition",
  //         right: { type: "variable", name: "tommy" }
  //       },
  //       ""
  //     ],
  //     [
  //       "Tommy aint nothing",
  //       "Tommy aint nothing",
  //       {
  //         type: "comparisonCondition",
  //         operator: "notEquals",
  //         left: { type: "variable", name: "tommy" },
  //         right: { type: "null" }
  //       },
  //       ""
  //     ],
  //     [
  //       "Aaa taking Bbb is not Ccc",
  //       "Aaa taking Bbb is not Ccc",
  //       {
  //         type: "comparisonCondition",
  //         operator: "notEquals",
  //         left: { type: "call", name: "aaa", args: [{ type: "variable", name: "bbb" }] },
  //         right: { type: "variable", name: "ccc" }
  //       },
  //       ""
  //     ]
  //   ]
  // },
  // {
  //   title: "precedence",
  //   parser: parseExpression2,
  //   cases: [
  //     [
  //       "operator precence",
  //       "Aaa taking Bbb times Ccc plus not Ddd times Eee and Fff",
  //       {
  //         type: "logicalBinaryCondition",
  //         operator: "and",
  //         left: {
  //           type: "arithmeticExpression",
  //           operator: "add",
  //           left: {
  //             type: "arithmeticExpression",
  //             operator: "multiply",
  //             left: {
  //               type: "call",
  //               name: "aaa",
  //               args: [{ type: "variable", name: "bbb" }]
  //             },
  //             right: { type: "variable", name: "ccc" }
  //           },
  //           right: {
  //             type: "arithmeticExpression",
  //             operator: "multiply",
  //             left: {
  //               type: "logicalNotCondition",
  //               right: { type: "variable", name: "ddd" }
  //             },
  //             right: { type: "variable", name: "eee" }
  //           }
  //         },
  //         right: { type: "variable", name: "fff" }
  //       },
  //       ""
  //     ]
  //   ]
  // }
];

describe("rockstar", () => {
  describe("parsing2", () => {
    describe("expressions", () => {
      for (const { title, parser, cases } of caseGroups) {
        describe(title, () => {
          for (const [
            test,
            source,
            expectedIsParseError,
            expectedParsed,
            expectedOffset
          ] of cases) {
            it(test, () => {
              const context: Context = { lineIndex: 0, offset: 0 };
              const parsed = parser(source, context);

              const isError = isParseError(parsed);
              if (isError !== expectedIsParseError) {
                console.log(source, parsed);
              }
              expect(isError).toEqual(expectedIsParseError);

              if (context.offset !== expectedOffset) {
                console.log(source, parsed);
              }
              expect(context.offset).toEqual(expectedOffset);

              if (!expectedIsParseError) {
                expect(parsed).toEqual(expectedParsed);
              }
            });
          }
        });
      }
    });
  });
});
