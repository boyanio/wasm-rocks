import * as rockstar from "./rockstar/ast";
import * as wasm from "./wasm/ast";

export const transform = (rockstarAst: rockstar.Program): wasm.Module => {
  const module = {
    exports: [] as wasm.Export[],
    functions: [] as wasm.Function[],
    imports: [] as wasm.Import[],
    memories: [] as wasm.Memory[]
  };

  const registeredCalls = new Map<wasm.Identifier, wasm.FunctionType>();

  const toIdentifier = (input: string): wasm.Identifier => `$${input}`;

  const transformFunctionInternal = (
    name: string,
    args: rockstar.NamedVariable[],
    result: rockstar.SimpleExpression | null,
    statements: rockstar.Statement[]
  ): wasm.Function => {
    const locals = new Map<string, number>(args.map((arg, index) => [arg.name, index]));
    const declaredRockstarVariables: rockstar.NamedVariable[] = [];
    const wasmFn: wasm.Function = {
      id: `$${name}`,
      functionType: {
        params: args.map(() => "f32"),
        result: result ? "f32" : null
      },
      instructions: [],
      locals: []
    };

    const indexFromLocals = (variable: rockstar.Variable): number => {
      let namedVariable: rockstar.NamedVariable;
      if (variable.type === "pronoun") {
        if (!declaredRockstarVariables.length)
          throw new Error("Cannot resolve pronoun - no variables declared");

        namedVariable = declaredRockstarVariables[declaredRockstarVariables.length - 1];
      } else {
        namedVariable = variable as rockstar.NamedVariable;
      }

      if (!locals.has(namedVariable.name)) {
        locals.set(namedVariable.name, locals.size);
      }
      return locals.get(namedVariable.name) as number;
    };

    const binaryOperationInstruction = (
      operation: wasm.BinaryOperation
    ): wasm.BinaryOperationInstruction => ({
      instructionType: "binaryOperation",
      operation
    });

    const unaryOperationInstruction = (
      operation: wasm.UnaryOperation
    ): wasm.UnaryOperationInstruction => ({
      instructionType: "unaryOperation",
      operation
    });

    const variableInstruction = (
      target: rockstar.Variable,
      operation: wasm.VariableInstructionOperation
    ): wasm.VariableInstruction => ({
      instructionType: "variable",
      operation,
      index: indexFromLocals(target)
    });

    const constInstruction = (value: number): wasm.ConstInstruction => ({
      instructionType: "const",
      value,
      valueType: "f32"
    });

    const binaryOperatorMap = new Map<rockstar.BinaryOperator, wasm.BinaryOperation>()
      .set("add", "f32.add")
      .set("divide", "f32.div")
      .set("multiply", "f32.mul")
      .set("subtract", "f32.sub");

    const transformBinaryOperator = (operator: rockstar.BinaryOperator): wasm.Instruction => {
      if (!binaryOperatorMap.has(operator)) throw new Error(`Unknown binary operator: ${operator}`);

      return binaryOperationInstruction(binaryOperatorMap.get(operator) as wasm.BinaryOperation);
    };

    const arithmeticRoundingDirectionMap = new Map<
      rockstar.ArithmeticRoundingDirection,
      wasm.UnaryOperation
    >()
      .set("up", "f32.ceil")
      .set("down", "f32.floor")
      .set("upOrDown", "f32.nearest");

    function transformArithmeticRounding(
      direction: rockstar.ArithmeticRoundingDirection
    ): wasm.Instruction {
      if (!arithmeticRoundingDirectionMap.has(direction))
        throw new Error(`Unknown arithmetic rounding direction: ${direction}`);

      return unaryOperationInstruction(
        arithmeticRoundingDirectionMap.get(direction) as wasm.UnaryOperation
      );
    }

    function transformSimpleExpression(
      rockstarExpression: rockstar.SimpleExpression
    ): wasm.Instruction {
      switch (rockstarExpression.type) {
        case "number":
          return constInstruction((rockstarExpression as rockstar.NumberLiteral).value);

        case "mysterious":
        case "null":
          return constInstruction(0);

        case "variable":
        case "pronoun":
          return variableInstruction(rockstarExpression as rockstar.Variable, "get");
      }

      throw new Error(`Cannot transform Rockstar simple expression: ${rockstarExpression}`);
    }

    function transformFunctionCall(rockstarCall: rockstar.FunctionCall): wasm.Instruction[] {
      const { name, args } = rockstarCall;
      const callId = toIdentifier(name);

      // register the function call
      if (!registeredCalls.has(callId)) {
        registeredCalls.set(callId, {
          params: args.map(() => "f32"),
          result: null
        });
      }

      return [
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        ...args.flatMap(transformExpression),
        {
          instructionType: "call",
          id: callId
        }
      ];
    }

    function transformExpression(rockstarExpression: rockstar.Expression): wasm.Instruction[] {
      switch (rockstarExpression.type) {
        case "binaryExpression": {
          // TODO
          return [];
        }

        case "unaryExpression": {
          // TODO
          return [];
        }

        case "call": {
          return transformFunctionCall(rockstarExpression);
        }

        default:
          return [transformSimpleExpression(rockstarExpression)];
      }
    }

    for (const statement of statements) {
      switch (statement.type) {
        case "variableDeclaration": {
          const { variable, value } = statement as rockstar.VariableDeclaration;
          declaredRockstarVariables.push(variable);
          wasmFn.instructions.push(transformSimpleExpression(value), {
            instructionType: "variable",
            operation: "set",
            index: indexFromLocals(variable)
          });
          break;
        }

        case "say": {
          const { what } = statement as rockstar.SayCall;
          wasmFn.instructions.push(
            ...transformFunctionCall({ type: "call", name: "print", args: [what] })
          );
          break;
        }

        case "call": {
          wasmFn.instructions.push(...transformFunctionCall(statement as rockstar.FunctionCall));
          break;
        }

        case "assignment": {
          const { target, expression } = statement as rockstar.Assignment;
          switch (expression.type) {
            case "binaryExpression": {
              wasmFn.instructions.push(
                ...transformExpression(expression.lhs),
                ...transformExpression(expression.rhs),
                transformBinaryOperator(expression.operator),
                variableInstruction(target, "set")
              );
              break;
            }

            case "unaryExpression": {
              // TODO
              break;
            }

            case "call": {
              // TODO
              break;
            }

            default: {
              wasmFn.instructions.push(
                transformSimpleExpression(expression),
                variableInstruction(target, "set")
              );
            }
          }
          break;
        }

        case "increment": {
          const { target } = statement as rockstar.IncrementOperation;
          wasmFn.instructions.push(
            transformSimpleExpression(target),
            constInstruction(1),
            binaryOperationInstruction("f32.add"),
            variableInstruction(target, "set")
          );
          break;
        }

        case "decrement": {
          const { target } = statement as rockstar.DecrementOperation;
          wasmFn.instructions.push(
            transformSimpleExpression(target),
            constInstruction(1),
            binaryOperationInstruction("f32.sub"),
            variableInstruction(target, "set")
          );
          break;
        }

        case "round": {
          const { target, direction } = statement as rockstar.ArithmeticRoundingOperation;
          wasmFn.instructions.push(
            transformSimpleExpression(target),
            transformArithmeticRounding(direction),
            variableInstruction(target, "set")
          );
          break;
        }

        case "comment": {
          const { comment } = statement as rockstar.Comment;
          wasmFn.instructions.push({
            instructionType: "comment",
            value: comment
          });
          break;
        }

        case "function": {
          const { name } = statement as rockstar.FunctionDeclaration;
          throw new Error(
            `Nestign functions within functions is nto allowed. Function ${name} encountered.`
          );
        }
      }
    }

    // add locals
    wasmFn.locals.push(
      ...Array.from(locals.values()).map<wasm.Local>(l => ({
        type: "local",
        index: l,
        localType: "f32"
      }))
    );

    return wasmFn;
  };

  const transformFunction = (func: rockstar.FunctionDeclaration): void => {
    const wasmFn = transformFunctionInternal(func.name, func.args, func.result, func.statements);
    module.functions.push(wasmFn);
  };

  const transformFunctions = (funcs: rockstar.FunctionDeclaration[]): void =>
    funcs.forEach(transformFunction);

  const transformMainFunction = (statements: rockstar.Statement[]): void => {
    const mainFn = transformFunctionInternal("main", [], null, statements);

    // Add result, as we intend to end the main procedure with 0
    mainFn.functionType.result = "i32";

    const endInstr: wasm.ConstInstruction = {
      instructionType: "const",
      value: 0,
      valueType: "i32"
    };
    mainFn.instructions.push(endInstr);

    // register the function
    module.functions.push(mainFn);

    // Export the main function
    module.exports.push({ id: mainFn.id, name: "main", exportType: "func" });
  };

  const createImportsForNonDefinedFunctions = (
    definedFunctions: Set<wasm.Identifier>
  ): wasm.Import[] =>
    Array.from(registeredCalls.keys())
      .filter(callId => !definedFunctions.has(callId))
      .map<wasm.Import>(callId => ({
        module: "env",
        name: callId.substring(1),
        importType: {
          name: "func",
          id: callId,
          functionType: registeredCalls.get(callId) as wasm.FunctionType
        }
      }));

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
  transformFunctions(fnNodes);
  transformMainFunction(nonFnNodes);

  // imports
  module.imports.push(
    ...createImportsForNonDefinedFunctions(
      new Set<wasm.Identifier>(module.functions.map(f => f.id))
    )
  );

  // memories
  module.memories.push({ id: "$0", memoryType: { minSize: 1 } });
  module.exports.push({ id: "$0", exportType: "memory", name: "memory" });

  return module;
};
