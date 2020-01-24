import * as rockstar from "./rockstar/ast";
import * as wasm from "./wasm/ast";
import { astFactory as wasmFactory } from "./wasm/astFactory";
import { resolveExpressionType } from "./rockstar/expressionTypeResolver";
import { getOrThrow } from "./utils/map-utils";

const wasmId = (input: string | number): wasm.Identifier =>
  "$" + `${input}`.replace(/\W/g, "").toLowerCase();

class FunctionLocals {
  private locals: Map<string, wasm.Identifier>;
  private skipLocals: number;
  private lastAccessedLocal: wasm.Identifier | null = null;

  constructor(initialVariables: rockstar.Variable[]) {
    this.skipLocals = initialVariables.length;
    this.locals = new Map<string, wasm.Identifier>(
      initialVariables.map(variable => [variable.name, wasmId(variable.name)])
    );
  }

  getOrAdd(target: rockstar.Variable | rockstar.Pronoun): wasm.Identifier {
    if (target.type === "pronoun") {
      if (!this.lastAccessedLocal)
        throw new Error("Cannot resolve pronoun - no variables declared in the scope");

      return this.lastAccessedLocal;
    }

    const variable = target as rockstar.Variable;
    if (!this.locals.has(variable.name)) {
      this.locals.set(variable.name, wasmId(variable.name));
    }

    this.lastAccessedLocal = this.locals.get(variable.name) as wasm.Identifier;
    return this.lastAccessedLocal;
  }

  build(): wasm.Local[] {
    // Skip initial ones, as they are automatically added
    return [...this.locals.values()].reduce(
      (locals, id, index) =>
        index >= this.skipLocals ? [...locals, wasmFactory.local(id)] : locals,
      [] as wasm.Local[]
    );
  }
}

export const transform = (rockstarAst: rockstar.Program): wasm.Module => {
  const wasmModule = {
    exports: [] as wasm.Export[],
    functions: [] as wasm.Function[],
    imports: [] as wasm.Import[],
    memories: [] as wasm.Memory[]
  };

  let loopsCount = 0;
  const processedFunctions: rockstar.FunctionDeclaration[] = [];
  const imports = new Map<string, wasm.Import>();

  const registerImport = ($import: wasm.Import): void => {
    if (!imports.has($import.name)) {
      imports.set($import.name, $import);
    }
  };

  const transformFunctionDeclarationInternal = (
    name: string,
    args: rockstar.Variable[],
    statements: rockstar.Statement[],
    result: rockstar.SimpleExpression | null
  ): wasm.Function => {
    const argStatements: rockstar.Statement[] = args.map(arg => ({
      type: "variableDeclaration",
      variable: arg,
      value: { type: "number", value: 0 }
    }));
    const processedStatements: rockstar.Statement[] = [];

    const wasmFn: wasm.Function = {
      id: wasmId(name),
      functionType: {
        params: args.map<wasm.Param>(arg => ({ valueType: "i32", id: wasmId(arg.name) })),
        resultType: "i32"
      },
      instructions: [],
      locals: []
    };

    const validateRockstarExpressionType = (expression: rockstar.Expression): void => {
      // all but the last statement
      const scope = [...argStatements, ...processedStatements.slice(0, -1)];
      const expressionType = resolveExpressionType(expression, scope, processedFunctions);
      switch (expressionType) {
        case "float":
          throw new Error("Floats are not supported by the transformation yet");
        case "string":
          throw new Error("Strings are not supported by the transformation yet");
      }
    };

    const locals = new FunctionLocals(args);

    const binaryOperatorMap = new Map<rockstar.BinaryOperator, wasm.BinaryOperation>()
      .set("add", "i32.add")
      .set("divide", "i32.div")
      .set("multiply", "i32.mul")
      .set("subtract", "i32.sub")
      .set("equals", "i32.eq")
      .set("notEquals", "i32.ne")
      .set("greaterThan", "i32.gt_s")
      .set("greaterThanOrEquals", "i32.ge_s")
      .set("lowerThan", "i32.lt_s")
      .set("lowerThanOrEquals", "i32.le_s")
      .set("and", "i32.and")
      .set("or", "i32.or")
      .set("xor", "i32.xor");

    const transformBinaryOperator = (operator: rockstar.BinaryOperator): wasm.Instruction =>
      wasmFactory.binaryOperation(
        getOrThrow(binaryOperatorMap, operator, `Unknown binary operator: ${operator}`)
      );

    const wrapInBlockIfNecessary = (instructions: wasm.Instruction[]): wasm.Instruction => {
      if (instructions.length === 1) return instructions[0];
      return {
        instructionType: "block",
        instructions,
        resultType: "i32"
      };
    };

    const transformExpression = (expression: rockstar.Expression): wasm.Instruction[] => {
      validateRockstarExpressionType(expression);

      switch (expression.type) {
        case "binaryExpression":
          return [
            wrapInBlockIfNecessary([
              wrapInBlockIfNecessary(transformExpression(expression.lhs)),
              wrapInBlockIfNecessary(transformExpression(expression.rhs)),
              transformBinaryOperator(expression.operator)
            ])
          ];

        case "unaryExpression": {
          // TODO
          throw new Error("Unary expressions are not implemented yet");
        }

        case "functionCall":
          return [
            wrapInBlockIfNecessary([
              ...expression.args.flatMap(transformExpression),
              wasmFactory.call(wasmId(expression.name))
            ])
          ];

        case "number":
          return [wasmFactory.const(expression.value)];

        case "boolean":
          return [wasmFactory.const(expression.value ? 1 : 0)];

        case "string":
          throw new Error("String expressions are not supperted by the transofmration yet");

        case "mysterious":
        case "null":
          return [wasmFactory.const(0)];

        case "pronoun":
        case "variable":
          return [wasmFactory.variable(locals.getOrAdd(expression), "get")];
      }
    };

    const arithmeticRoundingDirectionMap = new Map<
      rockstar.ArithmeticRoundingDirection,
      wasm.UnaryOperation
    >()
      .set("up", "f32.ceil")
      .set("down", "f32.floor")
      .set("upOrDown", "f32.nearest");

    const transformArithmeticRounding = (
      statement: rockstar.ArithmeticRoundingOperation
    ): wasm.Instruction[] => [
      ...transformExpression(statement.target),
      wasmFactory.unaryOperation("f32.convert_i32_s"),
      wasmFactory.unaryOperation(
        getOrThrow(
          arithmeticRoundingDirectionMap,
          statement.direction,
          `Unknown arithmetic rounding direction: ${statement.direction}`
        )
      ),
      wasmFactory.unaryOperation("i32.trunc_f32_s"),
      wasmFactory.variable(locals.getOrAdd(statement.target), "set")
    ];

    const transformAssignment = (statement: rockstar.Assignment): wasm.Instruction[] => [
      ...transformExpression(statement.expression),
      wasmFactory.variable(locals.getOrAdd(statement.target), "set")
    ];

    const transformVariableDeclaration = (
      statement: rockstar.VariableDeclaration
    ): wasm.Instruction[] => [
      ...transformExpression(statement.value),
      wasmFactory.variable(locals.getOrAdd(statement.variable), "set")
    ];

    const transformStatement = (statement: rockstar.Statement): wasm.Instruction[] => {
      processedStatements.push(statement);

      switch (statement.type) {
        case "variableDeclaration":
          return transformVariableDeclaration(statement);

        case "say": {
          const { what } = statement as rockstar.SayStatement;
          const id = wasmId("print");
          registerImport({
            module: "env",
            name: "print",
            importType: {
              name: "func",
              id,
              functionType: {
                params: [{ valueType: "i32", id: wasmId("what") }]
              }
            }
          });
          return [...transformExpression(what), wasmFactory.call(id)];
        }

        case "listen": {
          const { to } = statement as rockstar.ListenStatement;
          const id = wasmId("prompt");
          registerImport({
            module: "env",
            name: "prompt",
            importType: {
              name: "func",
              id,
              functionType: {
                params: [],
                resultType: "i32"
              }
            }
          });
          return [wasmFactory.call(id), wasmFactory.variable(locals.getOrAdd(to), "set")];
        }

        case "assignment":
          return transformAssignment(statement);

        case "increment":
          return [
            ...transformExpression(statement.target),
            wasmFactory.const(statement.times),
            wasmFactory.binaryOperation("i32.add"),
            wasmFactory.variable(locals.getOrAdd(statement.target), "set")
          ];

        case "decrement":
          return [
            ...transformExpression(statement.target),
            wasmFactory.const(statement.times),
            wasmFactory.binaryOperation("i32.sub"),
            wasmFactory.variable(locals.getOrAdd(statement.target), "set")
          ];

        case "round":
          return transformArithmeticRounding(statement);

        case "comment":
          return [
            {
              instructionType: "comment",
              value: statement.comment
            }
          ];

        case "if": {
          const { condition, then, $else } = statement;
          return [
            {
              instructionType: "if",
              condition: transformExpression(condition),
              then: then.statements.flatMap(transformStatement),
              $else: $else ? $else.statements.flatMap(transformStatement) : undefined
            }
          ];
        }

        case "loop": {
          loopsCount++;
          const { condition, body } = statement;
          const instructions: wasm.Instruction[] = [
            {
              instructionType: "block",
              id: wasmId(`loop${loopsCount - 1}block`),
              instructions: [
                {
                  instructionType: "loop",
                  id: wasmId(`loop${loopsCount - 1}`),
                  instructions: [
                    ...transformExpression(condition),
                    {
                      instructionType: "unaryOperation",
                      operation: "i32.eqz"
                    },
                    {
                      instructionType: "br_if",
                      id: wasmId(`loop${loopsCount - 1}`)
                    },
                    ...body.statements.flatMap(transformStatement),
                    {
                      instructionType: "br",
                      id: wasmId(`loop${loopsCount - 1}block`)
                    }
                  ]
                }
              ]
            }
          ];
          loopsCount--;
          return instructions;
        }

        case "continue":
          return [
            {
              instructionType: "br",
              id: wasmId(`loop${loopsCount - 1}`)
            }
          ];

        case "break":
          return [
            {
              instructionType: "br",
              id: wasmId(`loop${loopsCount - 1}block`)
            }
          ];
      }
      throw new Error("Unknown Rockstar statement");
    };

    statements.forEach(statement => {
      wasmFn.instructions.push(...transformStatement(statement));
    });

    if (result) {
      wasmFn.instructions.push(...transformExpression(result));
    }

    // build locals
    wasmFn.locals = locals.build();

    return wasmFn;
  };

  const transformFunctionDeclaration = (func: rockstar.FunctionDeclaration): void => {
    const wasmFn = transformFunctionDeclarationInternal(
      func.name,
      func.args,
      func.statements,
      func.result
    );
    wasmModule.functions.push(wasmFn);
    processedFunctions.push(func);
  };

  const transformFunctionDeclarations = (funcs: rockstar.FunctionDeclaration[]): void =>
    funcs.forEach(transformFunctionDeclaration);

  const transformMainFunctionDeclaration = (statements: rockstar.Statement[]): void => {
    const mainFn = transformFunctionDeclarationInternal("main", [], statements, null);

    // Add result, as we intend to end the main procedure with 0
    mainFn.functionType.resultType = "i32";
    mainFn.instructions.push(wasmFactory.const(0));

    // register the function
    wasmModule.functions.push(mainFn);

    // Export the main function
    wasmModule.exports.push({ id: mainFn.id, name: "main", exportType: "func" });
  };

  const { fnNodes, nonFnNodes } = rockstarAst.statements.reduce(
    (split, node) =>
      Object.assign(
        split,
        node.type === "function"
          ? { fnNodes: [...split.fnNodes, node] }
          : { nonFnNodes: [...split.nonFnNodes, node] }
      ),
    { fnNodes: [] as rockstar.FunctionDeclaration[], nonFnNodes: [] as rockstar.Statement[] }
  );

  const hasMainFn = fnNodes.find(node => node.name === "main") != null;
  if (hasMainFn) throw new Error("The function name `main` is reserved.");

  // functions
  transformFunctionDeclarations(fnNodes);
  transformMainFunctionDeclaration(nonFnNodes);

  // imports
  wasmModule.imports.push(...imports.values());

  // memory
  wasmModule.memories.push({ id: wasmId("memory"), memoryType: { minSize: 1 } });
  wasmModule.exports.push({ id: wasmId("memory"), exportType: "memory", name: "memory" });

  return wasmModule;
};
