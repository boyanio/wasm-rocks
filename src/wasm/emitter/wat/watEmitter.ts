import { VectorEncoder } from "../types";
import { Module, Function, Memory, Export, Import } from "../../ast";

export const emitWat = (ast: Module, encodeVector: VectorEncoder<string, string>): string => {
  const emitModule = (contents: string[]): string => encodeVector("module", ...contents);

  const emitMemory = (memory: Memory): string =>
    encodeVector(
      "memory",
      memory.id,
      memory.memoryType.minSize.toString(),
      ...(memory.memoryType.maxSize ? [memory.memoryType.maxSize.toString()] : [])
    );

  const emitFunction = (func: Function): string => {
    const { id, locals, instructions, functionType } = func;
    const body: string[] = [];

    // (local XX YY ZZ)
    if (locals.length) {
      body.push(encodeVector("local", ...locals.map(local => local.valueType)));
    }

    // body
    for (const instruction of instructions) {
      switch (instruction.instructionType) {
        case "variable": {
          const { operation, index } = instruction;
          body.push(encodeVector(`local.${operation}`, index.toString()));
          break;
        }

        case "call": {
          body.push(encodeVector("call", instruction.id));
          break;
        }

        case "const": {
          const { valueType, value } = instruction;
          body.push(encodeVector(`${valueType}.const`, value.toString()));
          break;
        }

        case "comment": {
          body.push(encodeVector(`; ${instruction.value} ;`));
          break;
        }

        case "binaryOperation": {
          body.push(instruction.operation);
          break;
        }

        case "unaryOperation": {
          body.push(instruction.operation);
          break;
        }
      }
    }

    // func (param XX)* (result YY) body
    return encodeVector(
      "func",
      id,
      ...functionType.params.map(p => encodeVector("param", p)),
      ...(functionType.result ? [functionType.result] : []).map(r => encodeVector("result", r)),
      ...body
    );
  };

  const emitExport = (ex: Export): string =>
    encodeVector("export", `"${ex.name}"`, encodeVector(ex.exportType, ex.id));

  const emitImport = (im: Import): string => {
    let importType: string;
    switch (im.importType.name) {
      case "func": {
        const { id, functionType } = im.importType;
        importType = emitFunction({
          id,
          functionType,
          instructions: [],
          locals: []
        });
        break;
      }

      case "memory": {
        const { id, memoryType } = im.importType;
        importType = emitMemory({ id, memoryType });
        break;
      }

      default:
        throw new Error(`Unsupported import type: ${im.importType}`);
    }
    return encodeVector("import", `"${im.module}"`, `"${im.name}"`, importType);
  };

  return emitModule([
    ...ast.imports.map(emitImport),
    ...ast.memories.map(emitMemory),
    ...ast.functions.map(emitFunction),
    ...ast.exports.map(emitExport)
  ]);
};
