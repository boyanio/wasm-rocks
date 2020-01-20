import { expression } from "../../../../src/rockstar/parser/expressions/expression";
import { Context } from "../../../../src/rockstar/parser/types";
import { isParseError } from "../../../../src/rockstar/parser/parsers";

type Case = [string, string, boolean, unknown, number];
type CaseGroup = {
  title: string;
  cases: Case[];
};

const caseGroups: CaseGroup[] = [
  {
    title: "identifiers",
    cases: [
      [
        "parses simple variable starting with a lowercase letter",
        "dog",
        false,
        { type: "variable", name: "dog" },
        3
      ],
      [
        "parses simple variable starting with an uppercase letter",
        "Dog",
        false,
        { type: "variable", name: "dog" },
        3
      ],
      [
        "does not parse simple variable containing an uppercase letter after the first letter",
        "dOg",
        true,
        null,
        0
      ],
      [
        "parses simple variable starting followed by punctuation",
        "dog,",
        false,
        { type: "variable", name: "dog" },
        4
      ],
      [
        "parses simple variable from a single letter",
        "D",
        false,
        { type: "variable", name: "d" },
        1
      ],
      ["does not parse simple variable of a keyword", "Your", true, null, 0],
      [
        "parses common variable starting with a lowercase letter",
        "my dog",
        false,
        { type: "variable", name: "my dog" },
        6
      ],
      [
        "parses common variable starting with an uppercase letter",
        "My dog",
        false,
        { type: "variable", name: "my dog" },
        6
      ],
      [
        "does not parse common variable containing an uppercase letter after the first letter",
        "my dOg",
        true,
        null,
        0
      ],
      [
        "parses common variable followed by punctuation",
        "my dog.",
        false,
        { type: "variable", name: "my dog" },
        7
      ],
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
      ["parses proper variable", "Myy Dog", false, { type: "variable", name: "Myy Dog" }, 7],
      [
        "parses proper variable followed by punctuation",
        "Myy Dog!",
        false,
        { type: "variable", name: "Myy Dog" },
        8
      ],
      [
        "does not proper variable containing an uppercase letter after the first letter in one of the words",
        "MYy DoG",
        true,
        null,
        0
      ]
    ]
  },
  {
    title: "pronouns",
    cases: [
      ["parses pronoun", "her", false, { type: "pronoun" }, 3],
      ["pronouns are case-sensitive", "Them", true, null, 0],
      ["does not parse pronoun", "bla bla", true, null, 0]
    ]
  },
  {
    title: "mysterious literals",
    cases: [
      ["parses mysterious", "mysterious", false, { type: "mysterious" }, 10],
      ["mysterious is case-sensitive", "mYsterious", true, null, 0]
    ]
  },
  {
    title: "null literals",
    cases: [
      ["parses null as null", "null", false, { type: "null" }, 4],
      ["parses null as nobody", "nobody", false, { type: "null" }, 6],
      ["parses null as gone", "gone", false, { type: "null" }, 4],
      ["parses null as empty", "empty", false, { type: "null" }, 5],
      ["parses null as nothing", "nothing", false, { type: "null" }, 7],
      ["parses null as nowhere", "nowhere", false, { type: "null" }, 7],
      ["null is case-sensitive", "nUll", true, null, 0]
    ]
  },
  {
    title: "boolean literals",
    cases: [
      ["parses true as true", "true", false, { type: "boolean", value: true }, 4],
      ["parses true as right", "right", false, { type: "boolean", value: true }, 5],
      ["parses true as yes", "yes", false, { type: "boolean", value: true }, 3],
      ["parses false as false", "false", false, { type: "boolean", value: false }, 5],
      ["parses false as wrong", "wrong", false, { type: "boolean", value: false }, 5],
      ["parses false as no", "no", false, { type: "boolean", value: false }, 2],
      ["parses false as lies", "lies", false, { type: "boolean", value: false }, 4],
      ["boolean is case-sensitive", "tRue", true, null, 0]
    ]
  },
  {
    title: "string literals",
    cases: [
      ["parses string", '"Hello there"', false, { type: "string", value: "Hello there" }, 13],
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
    cases: [
      ["parses integer", "123", false, { type: "number", value: 123 }, 3],
      ["parses floating-point number", "123.456", false, { type: "number", value: 123.456 }, 7],
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
    cases: [
      [
        "the brave without the fallen",
        "the brave without the fallen",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "the brave" },
          rhs: { type: "variable", name: "the fallen" },
          operator: "subtract"
        },
        28
      ],
      [
        "here minus there",
        "here minus there",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "here" },
          rhs: { type: "variable", name: "there" },
          operator: "subtract"
        },
        16
      ],
      [
        "here plus there",
        "here plus there",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "here" },
          rhs: { type: "variable", name: "there" },
          operator: "add"
        },
        15
      ],
      [
        "here with there",
        "here with there",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "here" },
          rhs: { type: "variable", name: "there" },
          operator: "add"
        },
        15
      ],
      [
        "here of there",
        "here of there",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "here" },
          rhs: { type: "variable", name: "there" },
          operator: "multiply"
        },
        13
      ],
      [
        "here times there",
        "here times there",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "here" },
          rhs: { type: "variable", name: "there" },
          operator: "multiply"
        },
        16
      ],
      [
        "here over there",
        "here over there",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "here" },
          rhs: { type: "variable", name: "there" },
          operator: "divide"
        },
        15
      ],
      [
        "here over 5",
        "here over 5",
        false,
        {
          type: "binaryExpression",
          lhs: { type: "variable", name: "here" },
          rhs: { type: "number", value: 5 },
          operator: "divide"
        },
        11
      ],
      [
        '"hello" over 6',
        '"hello" over 6',
        false,
        {
          type: "binaryExpression",
          lhs: { type: "string", value: "hello" },
          rhs: { type: "number", value: 6 },
          operator: "divide"
        },
        14
      ]
    ]
  },
  {
    title: "function calls",
    cases: [
      [
        "Multiply taking the cat",
        "Multiply taking the cat",
        false,
        {
          type: "functionCall",
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
          type: "functionCall",
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
          type: "functionCall",
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
          type: "functionCall",
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
          type: "functionCall",
          name: "multiply",
          args: [
            { type: "variable", name: "cool" },
            { type: "variable", name: "cool" }
          ]
        },
        29
      ],
      [
        'Multiply taking cool & "ya"',
        'Multiply taking cool & "ya"',
        false,
        {
          type: "functionCall",
          name: "multiply",
          args: [
            { type: "variable", name: "cool" },
            { type: "string", value: "ya" }
          ]
        },
        27
      ]
    ]
  },
  {
    title: "conditions",
    cases: [
      [
        "Tommy is nobody",
        "Tommy is nobody",
        false,
        {
          type: "binaryExpression",
          operator: "equals",
          lhs: { type: "variable", name: "tommy" },
          rhs: { type: "null" }
        },
        15
      ],
      [
        "not Tommy",
        "not Tommy",
        false,
        {
          type: "unaryExpression",
          operator: "not",
          rhs: { type: "variable", name: "tommy" }
        },
        9
      ],
      [
        "Tommy aint nothing",
        "Tommy aint nothing",
        false,
        {
          type: "binaryExpression",
          operator: "notEquals",
          lhs: { type: "variable", name: "tommy" },
          rhs: { type: "null" }
        },
        18
      ],
      [
        "Aaa taking Bbb is not Ccc",
        "Aaa taking Bbb is not Ccc",
        false,
        {
          type: "binaryExpression",
          operator: "notEquals",
          lhs: { type: "functionCall", name: "aaa", args: [{ type: "variable", name: "bbb" }] },
          rhs: { type: "variable", name: "ccc" }
        },
        25
      ]
    ]
  },
  {
    title: "precedence",
    cases: [
      [
        "Aaa taking Bbb times Ccc plus not Ddd times Eee and Fff",
        "Aaa taking Bbb times Ccc plus not Ddd times Eee and Fff",
        false,
        {
          type: "binaryExpression",
          operator: "and",
          lhs: {
            type: "binaryExpression",
            operator: "add",
            lhs: {
              type: "binaryExpression",
              operator: "multiply",
              lhs: {
                type: "functionCall",
                name: "aaa",
                args: [{ type: "variable", name: "bbb" }]
              },
              rhs: { type: "variable", name: "ccc" }
            },
            rhs: {
              type: "binaryExpression",
              operator: "multiply",
              lhs: {
                type: "unaryExpression",
                operator: "not",
                rhs: { type: "variable", name: "ddd" }
              },
              rhs: { type: "variable", name: "eee" }
            }
          },
          rhs: { type: "variable", name: "fff" }
        },
        55
      ]
    ]
  }
];

describe("rockstar", () => {
  describe("parser", () => {
    describe("expressions", () => {
      for (const { title, cases } of caseGroups) {
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
              const parsed = expression([source], context);

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
