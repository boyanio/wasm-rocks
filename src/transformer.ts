import * as rockstar from "./rockstar/ast";
import * as wasm from "./wasm/ast";
import { resolveExpressionType } from "./rockstar/expressionTypeResolver";

export const transform = (rockstarAst: rockstar.Program): wasm.Module => {
  const module = {
    exports: [] as wasm.Export[],
    functions: [] as wasm.Function[],
    imports: [] as wasm.Import[],
    memories: [] as wasm.Memory[]
  };

  const registeredCalls = new Map<wasm.Identifier, wasm.FunctionType>();
  const processedStatements: rockstar.Statement[] = [];

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
        params: args.map(() => "i32"),
        result: result ? "i32" : null
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

    const localIndex = (variable: rockstar.Variable): number => {
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
      index: localIndex(target)
    });

    const constInstruction = (value: number): wasm.ConstInstruction => ({
      instructionType: "const",
      value,
      valueType: "i32"
    });

    function transformSimpleExpression(expression: rockstar.SimpleExpression): wasm.Instruction {
      validateRockstarExpressionType(expression);

      switch (expression.type) {
        case "number":
          return constInstruction((expression as rockstar.NumberLiteral).value);

        case "boolean":
          return constInstruction((expression as rockstar.BooleanLiteral).value ? 1 : 0);

        case "string":
          throw new Error("String expressions are not supperted by the transofmration yet");

        case "mysterious":
        case "null":
          return constInstruction(0);

        case "variable":
        case "pronoun":
          return variableInstruction(expression as rockstar.Variable, "get");
      }
    }

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
      statement: rockstar.ArithmeticRoundingOperation
    ): wasm.Instruction[] {
      if (!arithmeticRoundingDirectionMap.has(statement.direction))
        throw new Error(`Unknown arithmetic rounding direction: ${statement.direction}`);

      return [
        transformSimpleExpression(statement.target),
        unaryOperationInstruction("f32.convert_i32_s"),
        unaryOperationInstruction(
          arithmeticRoundingDirectionMap.get(statement.direction) as wasm.UnaryOperation
        ),
        unaryOperationInstruction("i32.trunc_f32_s"),
        variableInstruction(statement.target, "set")
      ];
    }

    function transformFunctionCall(
      rockstarCall: rockstar.FunctionCallExpression,
      result: wasm.ValueType | null
    ): wasm.Instruction[] {
      const { name, args } = rockstarCall;
      const callId = toIdentifier(name);

      // register the function call
      if (!registeredCalls.has(callId)) {
        registeredCalls.set(callId, {
          params: args.map(() => "i32"),
          result
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

    function transformExpression(expression: rockstar.Expression): wasm.Instruction[] {
      switch (expression.type) {
        case "binaryExpression": {
          return [
            ...transformExpression(expression.lhs),
            ...transformExpression(expression.rhs),
            transformBinaryOperator(expression.operator)
          ];
        }

        case "unaryExpression": {
          // TODO
          return [];
        }

        case "functionCall": {
          return transformFunctionCall(expression, "i32");
        }

        default:
          return [transformSimpleExpression(expression)];
      }
    }

    function transformAssignment(statement: rockstar.Assignment): wasm.Instruction[] {
      return [
        ...transformExpression(statement.expression),
        variableInstruction(statement.target, "set")
      ];
    }

    function transformVariableDeclaration(
      statement: rockstar.VariableDeclaration
    ): wasm.Instruction[] {
      declaredRockstarVariables.push(statement.variable);

      return [
        transformSimpleExpression(statement.value),
        {
          instructionType: "variable",
          operation: "set",
          index: localIndex(statement.variable)
        }
      ];
    }

    for (const statement of statements) {
      switch (statement.type) {
        case "variableDeclaration": {
          wasmFn.instructions.push(
            ...transformVariableDeclaration(statement as rockstar.VariableDeclaration)
          );
          break;
        }

        case "say": {
          const { what } = statement as rockstar.SayStatement;
          wasmFn.instructions.push(
            ...transformFunctionCall({ type: "functionCall", name: "print", args: [what] }, null)
          );
          break;
        }

        case "listen": {
          const { to } = statement as rockstar.ListenStatement;
          wasmFn.instructions.push(
            ...transformFunctionCall({ type: "functionCall", name: "prompt", args: [] }, "i32"),
            variableInstruction(to, "set")
          );
          break;
        }

        case "assignment": {
          wasmFn.instructions.push(...transformAssignment(statement as rockstar.Assignment));
          break;
        }

        case "increment": {
          const { target } = statement as rockstar.IncrementOperation;
          wasmFn.instructions.push(
            transformSimpleExpression(target),
            constInstruction(1),
            binaryOperationInstruction("i32.add"),
            variableInstruction(target, "set")
          );
          break;
        }

        case "decrement": {
          const { target } = statement as rockstar.DecrementOperation;
          wasmFn.instructions.push(
            transformSimpleExpression(target),
            constInstruction(1),
            binaryOperationInstruction("i32.sub"),
            variableInstruction(target, "set")
          );
          break;
        }

        case "round": {
          wasmFn.instructions.push(
            ...transformArithmeticRounding(statement as rockstar.ArithmeticRoundingOperation)
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
            `Nesting functions within functions is not allowed. Function declaration ${name} encountered.`
          );
        }
      }

      processedStatements.push(statement);
    }

    // add locals
    wasmFn.locals.push(
      ...Array.from(locals.values()).map<wasm.Local>(l => ({
        type: "local",
        index: l,
        localType: "i32"
      }))
    );

    return wasmFn;
  };

  const transformFunction = (func: rockstar.FunctionDeclaration): void => {
    const wasmFn = transformFunctionInternal(func.name, func.args, func.result, func.statements);
    module.functions.unshift(wasmFn);
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
  transformMainFunction(nonFnNodes);
  transformFunctions(fnNodes);

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
