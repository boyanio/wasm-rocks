import { WatFormatter } from "./watFormatter";
import {
  Module,
  Function,
  VariableInstruction,
  CallControlInstruction,
  ConstInstruction,
  Memory,
  Export,
  Import,
  Comment,
  BinaryOperationInstruction,
  UnaryOperationInstruction
} from "../ast";

export const emitWat = (formatter: WatFormatter, ast: Module): string => {
  const emitModule = (contents: string[]): string => formatter("module", ...contents);

  const emitMemory = (memory: Memory): string =>
    formatter(
      "memory",
      memory.id,
      memory.memoryType.minSize.toString(),
      ...(memory.memoryType.maxSize ? [memory.memoryType.maxSize.toString()] : [])
    );

  const emitFunction = (func: Function): string => {
    const { id, locals = [], instructions = [], functionType = {} } = func;
    const body: string[] = [];

    // (local XX)
    body.push(...(locals || []).map(l => formatter("local", l.localType)));

    // body
    for (const instruction of instructions || []) {
      switch (instruction.instructionType) {
        case "variable": {
          const variable = instruction as VariableInstruction;
          body.push(formatter(`local.${variable.operation}`, variable.index.toString()));
          break;
        }

        case "call": {
          const call = instruction as CallControlInstruction;
          body.push(formatter("call", call.id));
          break;
        }

        case "const": {
          const constInst = instruction as ConstInstruction;
          body.push(formatter(`${constInst.valueType}.const`, constInst.value.toString()));
          break;
        }

        case "comment": {
          const comment = instruction as Comment;
          body.push(formatter(`; ${comment.value} ;`));
          break;
        }

        case "binaryOperation": {
          const binaryOperation = instruction as BinaryOperationInstruction;
          body.push(binaryOperation.operation);
          break;
        }

        case "unaryOperation": {
          const unaryOperation = instruction as UnaryOperationInstruction;
          body.push(unaryOperation.operation);
          break;
        }
      }
    }

    // func (param XX)* (result YY) body
    return formatter(
      "func",
      id,
      ...(functionType.params || []).map(p => formatter("param", p)),
      ...(functionType.result ? [functionType.result] : []).map(r => formatter("result", r)),
      ...body
    );
  };

  const emitExport = (ex: Export): string =>
    formatter("export", `"${ex.name}"`, formatter(ex.exportType, ex.id));

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
    }
    return formatter("import", `"${im.module}"`, `"${im.name}"`, importType);
  };

  return emitModule([
    ...(ast.imports || []).map(emitImport),
    ...(ast.memories || []).map(emitMemory),
    ...(ast.functions || []).map(emitFunction),
    ...(ast.exports || []).map(emitExport)
  ]);
};
