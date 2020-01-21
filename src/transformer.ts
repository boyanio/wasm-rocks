import * as rockstar from "./rockstar/ast";
import * as wasm from "./wasm/ast";
import { astFactory as wasmFactory } from "./wasm/astFactory";
import { resolveExpressionType } from "./rockstar/expressionTypeResolver";
import { getOrThrow } from "./utils/map-utils";

class FunctionLocals {
  private locals: Map<string, number>;
  private skipLocals: number;
  private lastAccessedLocal: number | null = null;

  constructor(initialVariables: rockstar.Variable[]) {
    this.skipLocals = initialVariables.length;
    this.locals = new Map<string, number>(
      initialVariables.map((variable, index) => [variable.name, index])
    );
  }

  getOrAdd(target: rockstar.Variable | rockstar.Pronoun): number {
    if (target.type === "pronoun") {
      if (!this.lastAccessedLocal)
        throw new Error("Cannot resolve pronoun - no variables declared in the scope");

      return this.lastAccessedLocal;
    }

    const variable = target as rockstar.Variable;
    if (!this.locals.has(variable.name)) {
      this.locals.set(variable.name, this.locals.size);
    }

    this.lastAccessedLocal = this.locals.get(variable.name) as number;
    return this.lastAccessedLocal;
  }

  build(): wasm.Local[] {
    // Skip initial ones, as they are automatically added
    return [...this.locals.values()].reduce(
      (locals, index) => (index >= this.skipLocals ? [...locals, wasmFactory.local()] : locals),
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

  const processedStatements: rockstar.Statement[] = [];
  const imports = new Map<string, wasm.Import>();

  const registerImport = ($import: wasm.Import): void => {
    if (!imports.has($import.name)) {
      imports.set($import.name, $import);
    }
  };

  const wasmIdentifier = (input: string): wasm.Identifier => `$${input}`;

  const transformFunctionDeclarationInternal = (
    name: string,
    args: rockstar.Variable[],
    statements: rockstar.Statement[]
  ): wasm.Function => {
    const wasmFn: wasm.Function = {
      id: `$${name}`,
      functionType: {
        params: args.map(() => "i32"),
        result: "i32"
      },
      instructions: [],
      locals: []
    };

    const validateRockstarExpressionType = (expression: rockstar.Expression): void => {
      const expressionType = resolveExpressionType(expression, processedStatements);
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
      .set("lowerThanOrEquals", "i32.le_s");

    const transformBinaryOperator = (operator: rockstar.BinaryOperator): wasm.Instruction =>
      wasmFactory.binaryOperation(
        getOrThrow(binaryOperatorMap, operator, `Unknown binary operator: ${operator}`)
      );

    const transformExpression = (expression: rockstar.Expression): wasm.Instruction[] => {
      const transformFunctionCall = (
        functionCall: rockstar.FunctionCallExpression
      ): wasm.Instruction[] => [
        ...functionCall.args.flatMap(transformExpression),
        wasmFactory.call(functionCall.name)
      ];

      const transformSimpleExpression = (
        expression: rockstar.SimpleExpression
      ): wasm.Instruction => {
        validateRockstarExpressionType(expression);

        switch (expression.type) {
          case "number":
            return wasmFactory.const(expression.value);

          case "boolean":
            return wasmFactory.const(expression.value ? 1 : 0);

          case "string":
            throw new Error("String expressions are not supperted by the transofmration yet");

          case "mysterious":
          case "null":
            return wasmFactory.const(0);

          case "pronoun":
          case "variable":
            return wasmFactory.variable(locals.getOrAdd(expression), "get");
        }
      };

      switch (expression.type) {
        case "binaryExpression":
          return [
            ...transformExpression(expression.lhs),
            ...transformExpression(expression.rhs),
            transformBinaryOperator(expression.operator)
          ];

        case "unaryExpression": {
          // TODO
          return [];
        }

        case "functionCall":
          return transformFunctionCall(expression);

        default:
          return [transformSimpleExpression(expression)];
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

    statements.forEach(statement => {
      switch (statement.type) {
        case "variableDeclaration": {
          wasmFn.instructions.push(...transformVariableDeclaration(statement));
          break;
        }

        case "say": {
          const { what } = statement as rockstar.SayStatement;
          const id = wasmIdentifier("print");
          wasmFn.instructions.push(...transformExpression(what), wasmFactory.call(id));
          registerImport({
            module: "env",
            name: "print",
            importType: {
              name: "func",
              id,
              functionType: {
                params: ["i32"],
                result: null
              }
            }
          });
          break;
        }

        case "listen": {
          const { to } = statement as rockstar.ListenStatement;
          const id = wasmIdentifier("prompt");
          wasmFn.instructions.push(
            wasmFactory.call(id),
            wasmFactory.variable(locals.getOrAdd(to), "set")
          );
          registerImport({
            module: "env",
            name: "prompt",
            importType: {
              name: "func",
              id,
              functionType: {
                params: [],
                result: "i32"
              }
            }
          });
          break;
        }

        case "assignment": {
          wasmFn.instructions.push(...transformAssignment(statement));
          break;
        }

        case "increment": {
          const { target } = statement;
          wasmFn.instructions.push(
            ...transformExpression(target),
            wasmFactory.const(1),
            wasmFactory.binaryOperation("i32.add"),
            wasmFactory.variable(locals.getOrAdd(target), "set")
          );
          break;
        }

        case "decrement": {
          const { target } = statement;
          wasmFn.instructions.push(
            ...transformExpression(target),
            wasmFactory.const(1),
            wasmFactory.binaryOperation("i32.sub"),
            wasmFactory.variable(locals.getOrAdd(target), "set")
          );
          break;
        }

        case "round": {
          wasmFn.instructions.push(...transformArithmeticRounding(statement));
          break;
        }

        case "comment": {
          const { comment } = statement;
          wasmFn.instructions.push({
            instructionType: "comment",
            value: comment
          });
          break;
        }
      }

      processedStatements.push(statement);
    });

    // build locals
    wasmFn.locals = locals.build();

    return wasmFn;
  };

  const transformFunctionDeclaration = (func: rockstar.FunctionDeclaration): void => {
    const wasmFn = transformFunctionDeclarationInternal(func.name, func.args, func.statements);
    wasmModule.functions.push(wasmFn);
  };

  const transformFunctionDeclarations = (funcs: rockstar.FunctionDeclaration[]): void =>
    funcs.forEach(transformFunctionDeclaration);

  const transformMainFunctionDeclaration = (statements: rockstar.Statement[]): void => {
    const mainFn = transformFunctionDeclarationInternal("main", [], statements);

    // Add result, as we intend to end the main procedure with 0
    mainFn.functionType.result = "i32";
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
  wasmModule.memories.push({ id: "$0", memoryType: { minSize: 1 } });
  wasmModule.exports.push({ id: "$0", exportType: "memory", name: "memory" });

  return wasmModule;
};
