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

  const transformFunctionBody = (wasmFn: wasm.Function, statements: rockstar.Statement[]): void => {
    // TODO: prepopulate locals with functions args from wasnFm.functionType
    const locals = new Map<string, number>();

    const declaredRockstarVariables: rockstar.Variable[] = [];

    const indexFromLocals = (identifier: rockstar.Identifier): number => {
      let variable: rockstar.Variable;
      if (identifier.type === "pronoun") {
        if (!declaredRockstarVariables.length)
          throw new Error("Cannot resolve pronoun - no variables declared");

        variable = declaredRockstarVariables[declaredRockstarVariables.length - 1];
      } else {
        variable = identifier as rockstar.Variable;
      }

      if (!locals.has(variable.name)) {
        locals.set(variable.name, locals.size);
      }
      return locals.get(variable.name) as number;
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
      target: rockstar.Identifier,
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

    const arithmeticOperatorMap = new Map<rockstar.ArithmeticOperator, wasm.BinaryOperation>()
      .set("add", "f32.add")
      .set("divide", "f32.div")
      .set("multiply", "f32.mul")
      .set("subtract", "f32.sub");

    const transformArithmeticExpression = (
      operator: rockstar.ArithmeticOperator
    ): wasm.Instruction => {
      if (!arithmeticOperatorMap.has(operator))
        throw new Error(`Unknown arithmetic operator: ${operator}`);

      return binaryOperationInstruction(
        arithmeticOperatorMap.get(operator) as wasm.BinaryOperation
      );
    };

    const arithmeticRoundingDirectionMap = new Map<
      rockstar.ArithmeticRoundingDirection,
      wasm.UnaryOperation
    >()
      .set("up", "f32.ceil")
      .set("down", "f32.floor")
      .set("upOrDown", "f32.nearest");

    const transformArithmeticRounding = (
      direction: rockstar.ArithmeticRoundingDirection
    ): wasm.Instruction => {
      if (!arithmeticRoundingDirectionMap.has(direction))
        throw new Error(`Unknown arithmetic rounding direction: ${direction}`);

      return unaryOperationInstruction(
        arithmeticRoundingDirectionMap.get(direction) as wasm.UnaryOperation
      );
    };

    const transformSimpleExpression = (
      rockstarExpression: rockstar.SimpleExpression
    ): wasm.Instruction => {
      switch (rockstarExpression.type) {
        case "number":
          return constInstruction((rockstarExpression as rockstar.NumberLiteral).value);

        case "mysterious":
        case "null":
          return constInstruction(0);

        case "variable":
        case "pronoun":
          return variableInstruction(rockstarExpression as rockstar.Identifier, "get");
      }

      throw new Error(`Cannot transform Rockstar simple expression: ${rockstarExpression}`);
    };

    const transformFunctionCall = (rockstarCall: rockstar.FunctionCall): void => {
      const { name, args } = rockstarCall;
      const callId = toIdentifier(name);

      // register the function call
      if (!registeredCalls.has(callId)) {
        registeredCalls.set(callId, {
          params: args.map(() => "f32"),
          result: null
        });
      }

      wasmFn.instructions.push(...args.map(transformSimpleExpression), {
        instructionType: "call",
        id: callId
      });
    };

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
          transformFunctionCall({ type: "call", name: "print", args: [what] });
          break;
        }

        case "call": {
          transformFunctionCall(statement as rockstar.FunctionCall);
          break;
        }

        case "compoundAssignment": {
          const { target, operator, right } = statement as rockstar.CompoundAssignment;
          wasmFn.instructions.push(
            transformSimpleExpression(target),
            transformSimpleExpression(right),
            transformArithmeticExpression(operator),
            variableInstruction(target, "set")
          );
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
  };

  const transformFunction = (func: rockstar.FunctionDeclaration): void => {
    const wasmFn: wasm.Function = {
      id: `$${func.name}`,
      functionType: {
        params: func.args.map(() => "f32"),
        result: "f32"
      },
      instructions: [],
      locals: []
    };
    transformFunctionBody(wasmFn, func.statements);

    // register the function
    module.functions.push(wasmFn);
  };

  const transformFunctions = (funcs: rockstar.FunctionDeclaration[]): void =>
    funcs.forEach(transformFunction);

  const transformMainFunction = (statements: rockstar.Statement[]): void => {
    const mainFn: wasm.Function = {
      id: "$main",
      functionType: {
        params: [],
        result: "i32"
      },
      instructions: [],
      locals: []
    };
    transformFunctionBody(mainFn, statements);

    // Add result, as we intend to end the main procedure with 0
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

  const { fnNodes, nonFnNodes } = rockstarAst.reduce(
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
