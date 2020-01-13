import * as rockstar from "./rockstar/ast";
import * as wasm from "./wasm/ast";

export const transform = (ast: rockstar.Program): wasm.Module => {
  const module = {
    exports: [] as wasm.Export[],
    functions: [] as wasm.Function[],
    imports: [] as wasm.Import[],
    memories: [] as wasm.Memory[]
  };

  const registeredCalls = new Map<wasm.Identifier, wasm.FunctionType>();

  const toIdentifier = (input: string): wasm.Identifier => `$${input}`;

  const transformMain = (statements: rockstar.Statement[]): void => {
    const instructions: wasm.Instruction[] = [];
    const locals = new Map<string, number>();

    const indexFromLocals = (variable: rockstar.Variable): number => {
      if (!locals.get(variable.name)) {
        locals.set(variable.name, locals.size);
      }
      return locals.get(variable.name) as number;
    };

    const transformSimpleExpression = (
      rockstarExpression: rockstar.SimpleExpression
    ): wasm.Instruction => {
      switch (rockstarExpression.type) {
        case "number": {
          const wasmInstr: wasm.ConstInstruction = {
            instructionType: "const",
            value: (rockstarExpression as rockstar.NumberLiteral).value,
            valueType: "f32"
          };
          return wasmInstr;
        }

        case "mysterious":
        case "null": {
          const wasmInstr: wasm.ConstInstruction = {
            instructionType: "const",
            value: 0,
            valueType: "f32"
          };
          return wasmInstr;
        }

        case "variable": {
          const wasmInstr: wasm.VariableInstruction = {
            instructionType: "variable",
            operation: "get",
            index: indexFromLocals(rockstarExpression as rockstar.Variable)
          };
          return wasmInstr;
        }

        case "pronoun": {
          if (!locals.size) throw new Error("Cannot resolve pronoun - no variables declared");

          const wasmInstr: wasm.VariableInstruction = {
            instructionType: "variable",
            operation: "get",
            index: locals.size - 1
          };
          return wasmInstr;
        }
      }

      throw new Error(`Cannot transform Rockstar simple expression: ${rockstarExpression}`);
    };

    const transformFunctionCall = (rockstarCall: rockstar.FunctionCall): void => {
      const { name, args } = rockstarCall;
      const callId = toIdentifier(name);

      // register the function call
      if (!registeredCalls.has(callId)) {
        registeredCalls.set(callId, {
          params: args.map(() => "f32")
        });
      }

      const wasmCall: wasm.CallControlInstruction = {
        instructionType: "call",
        id: callId
      };
      instructions.push(...args.map(transformSimpleExpression), wasmCall);
    };

    for (const statement of statements) {
      switch (statement.type) {
        case "variableDeclaration": {
          const { variable, value } = statement as rockstar.VariableDeclaration;
          const wasmSetLocal: wasm.VariableInstruction = {
            instructionType: "variable",
            operation: "set",
            index: indexFromLocals(variable)
          };
          instructions.push(transformSimpleExpression(value), wasmSetLocal);
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
      }
    }

    // Add result, as we intend to end the main procedure with 0
    const endInstr: wasm.ConstInstruction = {
      instructionType: "const",
      value: 0,
      valueType: "i32"
    };
    instructions.push(endInstr);

    const mainId = toIdentifier("main");
    module.exports.push({
      id: mainId,
      name: "main",
      exportType: "func"
    });

    module.functions.push({
      id: mainId,
      functionType: {
        params: [],
        result: "i32"
      },
      locals: Array.from(locals.values()).map<wasm.Local>(x => ({
        index: x,
        localType: "f32"
      })),
      instructions
    });
  };

  const { fnNodes, nonFnNodes } = ast.reduce(
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

  transformMain(nonFnNodes);

  // Create imports for called functions that are not defined in the module
  const definedWasmFunctionIds = new Set<string>(module.functions.map(f => f.id));
  const wasmFunctionImports = Array.from(registeredCalls.keys())
    .filter(callId => !definedWasmFunctionIds.has(callId))
    .map<wasm.Import>(callId => ({
      module: "env",
      name: callId.substring(1),
      importType: {
        name: "func",
        id: callId,
        functionType: registeredCalls.get(callId) as wasm.FunctionType
      }
    }));
  module.imports.push(...wasmFunctionImports);

  // memories
  module.memories.push({ id: "$0", memoryType: { minSize: 1 } });
  module.exports.push({ id: "$0", exportType: "memory", name: "memory" });

  return module;
};
