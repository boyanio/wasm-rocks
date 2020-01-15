import {
  parseIdentifier2,
  parseMysteriousLiteral2,
  parseNullLiteral2,
  parseBooleanLiteral2,
  parseStringLiteral2,
  parseNumberLiteral2,
  parsePronoun2,
  parseArithmeticExpression2,
  parseFunctionCall2,
  parseCondition2,
  parseExpression2
} from "../../../src/rockstar/parser/parseExpression";

type Case = [string, string, object | string | null, string];
type CaseGroup = {
  parser: Function;
  title: string;
  cases: Case[];
};

const caseGroups: CaseGroup[] = [
  {
    title: "identifiers",
    parser: parseIdentifier2,
    cases: [
      ["parses simple variable name starting with a lowercase letter", "dog", "dog", ""],
      ["parses simple variable name starting with an uppercase letter", "Dog", "dog", ""],
      [
        "does not parse simple variable name containing an uppercase letter after the first letter",
        "dOg",
        null,
        "dOg"
      ],
      [
        "parses simple variable name starting followed by a non-alphanumeric char",
        "dog,",
        "dog",
        ","
      ],
      ["parses simple variable name from a single letter", "D", "d", ""],
      ["does not parse simple variable name of a keyword", "Your", null, "Your"],
      ["parses simple variable name partially", "dog is very cool", "dog", "is very cool"],
      ["parses common variable name starting with a lowercase letter", "my dog", "my dog", ""],
      ["parses common variable name starting with an uppercase letter", "My dog", "my dog", ""],
      [
        "does not parse common variable name containing an uppercase letter after the first letter",
        "my dOg",
        null,
        "my dOg"
      ],
      ["parses common variable name partially", "my dog cat", "my dog", "cat"],
      ["parses common variable followed by a non-alphanumeric char", "my dog.", "my dog", "."],
      [
        "does not parse common variable name when the second word is a keyword",
        "my nobody",
        null,
        "my nobody"
      ],
      [
        "does not parse proper variable name when it starts similarly to a common one",
        "My Dog",
        null,
        "My Dog"
      ],
      ["parses proper variable name", "Myy Dog", "Myy Dog", ""],
      ["parses proper variable name partially", "Myy Dog is cool", "Myy Dog", "is cool"],
      ["parses proper variable followed by a non-alphanumeric char", "Myy Dog!", "Myy Dog", "!"],
      [
        "does not proper variable name containing an uppercase letter after the first letter in one of the words",
        "MYy DoG",
        null,
        "MYy DoG"
      ]
    ]
  },
  {
    title: "pronouns",
    parser: parsePronoun2,
    cases: [
      ["parses pronoun", "her", { type: "pronoun" }, ""],
      ["parses pronoun partially", "them bla", { type: "pronoun" }, "bla"],
      ["pronouns are case-sensitive", "Them", null, "Them"],
      ["does not parse pronoun", "bla bla", null, "bla bla"]
    ]
  },
  {
    title: "mysterious literals",
    parser: parseMysteriousLiteral2,
    cases: [
      ["parses mysterious", "mysterious", { type: "mysterious" }, ""],
      ["mysterious is case-sensitive", "mYsterious", null, "mYsterious"],
      ["parses mysterious partially", "mysterious is cool", { type: "mysterious" }, "is cool"]
    ]
  },
  {
    title: "null literals",
    parser: parseNullLiteral2,
    cases: [
      ["parses null as null", "null", { type: "null" }, ""],
      ["parses null as nobody", "nobody", { type: "null" }, ""],
      ["parses null as gone", "gone", { type: "null" }, ""],
      ["parses null as empty", "empty", { type: "null" }, ""],
      ["parses null as nothing", "nothing", { type: "null" }, ""],
      ["parses null as nowhere", "nowhere", { type: "null" }, ""],
      ["null is case-sensitive", "nUll", null, "nUll"],
      ["parses null partially", "nobody is cool", { type: "null" }, "is cool"]
    ]
  },
  {
    title: "boolean literals",
    parser: parseBooleanLiteral2,
    cases: [
      ["parses true as true", "true", { type: "boolean", value: true }, ""],
      ["parses true as right", "right", { type: "boolean", value: true }, ""],
      ["parses true as yes", "yes", { type: "boolean", value: true }, ""],
      ["parses false as false", "false", { type: "boolean", value: false }, ""],
      ["parses false as wrong", "wrong", { type: "boolean", value: false }, ""],
      ["parses false as no", "no", { type: "boolean", value: false }, ""],
      ["parses false as lies", "lies", { type: "boolean", value: false }, ""],
      ["boolean is case-sensitive", "tRue", null, "tRue"],
      ["parses boolean partially", "yes it is cool", { type: "boolean", value: true }, "it is cool"]
    ]
  },
  {
    title: "string literals",
    parser: parseStringLiteral2,
    cases: [
      ["parses string", '"Hello there"', { type: "string", value: "Hello there" }, ""],
      [
        "parses string partially",
        '"Hello there" or come back',
        { type: "string", value: "Hello there" },
        "or come back"
      ],
      ["parses empty string", '""', { type: "string", value: "" }, ""],
      [
        "does not parse string without a starting double quote",
        'Hello" there',
        null,
        'Hello" there'
      ],
      [
        "does not parse string without matching closing double quote",
        '"Hello there',
        null,
        '"Hello there'
      ],
      ["does not parse string with a double quote", '"', null, '"']
    ]
  },
  {
    title: "number literals",
    parser: parseNumberLiteral2,
    cases: [
      ["parses integer", "123", { type: "number", value: 123 }, ""],
      ["parses floating-point number", "123.456", { type: "number", value: 123.456 }, ""],
      ["parses number partially", "123.456 987", { type: "number", value: 123.456 }, "987"],
      [
        "does not parse number if the input starts with a non-numerical character",
        "x123 s",
        null,
        "x123 s"
      ],
      ["does not parse number if it is not separated by whitespace", "123x", null, "123x"]
    ]
  },
  {
    title: "arithmetic expressions",
    parser: parseArithmeticExpression2,
    cases: [
      [
        "the brave without the fallen",
        "the brave without the fallen",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "the brave" },
          right: { type: "variable", name: "the fallen" },
          operator: "subtract"
        },
        ""
      ],
      [
        "here minus there",
        "here minus there",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "subtract"
        },
        ""
      ],
      [
        "here minus there and some other stuff",
        "here minus there and some other stuff",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "subtract"
        },
        "and some other stuff"
      ],
      [
        "here plus there",
        "here plus there",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "add"
        },
        ""
      ],
      [
        "here with there",
        "here with there",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "add"
        },
        ""
      ],
      [
        "here of there",
        "here of there",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "multiply"
        },
        ""
      ],
      [
        "here times there",
        "here times there",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "multiply"
        },
        ""
      ],
      [
        "here over there",
        "here over there",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "variable", name: "there" },
          operator: "divide"
        },
        ""
      ],
      [
        "here over 5",
        "here over 5",
        {
          type: "arithmeticExpression",
          left: { type: "variable", name: "here" },
          right: { type: "number", value: 5 },
          operator: "divide"
        },
        ""
      ],
      [
        '"hello" over 5',
        '"hello" over 5',
        {
          type: "arithmeticExpression",
          left: { type: "string", value: "hello" },
          right: { type: "number", value: 5 },
          operator: "divide"
        },
        ""
      ]
    ]
  },
  {
    title: "function calls",
    parser: parseFunctionCall2,
    cases: [
      [
        "Multiply taking the cat",
        "Multiply taking the cat",
        {
          type: "call",
          name: "multiply",
          args: [{ type: "variable", name: "the cat" }]
        },
        ""
      ],
      [
        'Multiply taking "yo yo"',
        'Multiply taking "yo yo"',
        {
          type: "call",
          name: "multiply",
          args: [{ type: "string", value: "yo yo" }]
        },
        ""
      ],
      [
        "Multiply taking 5",
        "Multiply taking 5",
        {
          type: "call",
          name: "multiply",
          args: [{ type: "number", value: 5 }]
        },
        ""
      ],
      [
        "Multiply taking 5 'n' cool",
        "Multiply taking 5 'n' cool",
        {
          type: "call",
          name: "multiply",
          args: [
            { type: "number", value: 5 },
            { type: "variable", name: "cool" }
          ]
        },
        ""
      ],
      [
        "Multiply taking cool and cool",
        "Multiply taking cool and cool",
        {
          type: "call",
          name: "multiply",
          args: [
            { type: "variable", name: "cool" },
            { type: "variable", name: "cool" }
          ]
        },
        ""
      ],
      [
        'Multiply taking cool, "ya"',
        'Multiply taking cool, "ya"',
        {
          type: "call",
          name: "multiply",
          args: [
            { type: "variable", name: "cool" },
            { type: "string", value: "ya" }
          ]
        },
        ""
      ]
    ]
  },
  {
    title: "conditions",
    parser: parseCondition2,
    cases: [
      [
        "Tommy is nobody",
        "Tommy is nobody",
        {
          type: "comparisonCondition",
          operator: "equals",
          left: { type: "variable", name: "tommy" },
          right: { type: "null" }
        },
        ""
      ],
      [
        "not Tommy",
        "not Tommy",
        {
          type: "logicalNotCondition",
          right: { type: "variable", name: "tommy" }
        },
        ""
      ],
      [
        "Tommy aint nothing",
        "Tommy aint nothing",
        {
          type: "comparisonCondition",
          operator: "notEquals",
          left: { type: "variable", name: "tommy" },
          right: { type: "null" }
        },
        ""
      ],
      [
        "Aaa taking Bbb is not Ccc",
        "Aaa taking Bbb is not Ccc",
        {
          type: "comparisonCondition",
          operator: "notEquals",
          left: { type: "call", name: "aaa", args: [{ type: "variable", name: "bbb" }] },
          right: { type: "variable", name: "ccc" }
        },
        ""
      ]
    ]
  },
  {
    title: "precedence",
    parser: parseExpression2,
    cases: [
      [
        "operator precence",
        "Aaa taking Bbb times Ccc plus not Ddd times Eee and Fff",
        {
          type: "logicalBinaryCondition",
          operator: "and",
          left: {
            type: "arithmeticExpression",
            operator: "add",
            left: {
              type: "arithmeticExpression",
              operator: "multiply",
              left: {
                type: "call",
                name: "aaa",
                args: [{ type: "variable", name: "bbb" }]
              },
              right: { type: "variable", name: "ccc" }
            },
            right: {
              type: "arithmeticExpression",
              operator: "multiply",
              left: {
                type: "logicalNotCondition",
                right: { type: "variable", name: "ddd" }
              },
              right: { type: "variable", name: "eee" }
            }
          },
          right: { type: "variable", name: "fff" }
        },
        ""
      ]
    ]
  }
];

describe("rockstar", () => {
  describe("parser", () => {
    describe("expressions", () => {
      for (const { title, parser, cases } of caseGroups) {
        describe(title, () => {
          for (const [test, expression, expectedParsed, expectedUnparsed] of cases) {
            it(test, () => {
              const [parsed, unparsed] = parser(expression);
              console.log(parsed);
              expect(parsed).toEqual(expectedParsed);
              expect(unparsed).toEqual(expectedUnparsed);
            });
          }
        });
      }
    });
  });
});
