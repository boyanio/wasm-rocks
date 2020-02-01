import {
  Module,
  Function,
  Memory,
  Export,
  Import,
  Instruction,
  ValueType,
  DataSegment,
  ConstInstruction
} from "../../ast";
import { WatFormatter } from "./formatter";

export const emitWat = (ast: Module, format: WatFormatter): string => {
  const emitMemory = (memory: Memory): unknown[] => [
    "memory",
    memory.id,
    memory.memoryType.minSize,
    memory.memoryType.maxSize ? memory.memoryType.maxSize : undefined
  ];

  const emitConst = ($const: ConstInstruction): unknown[] => [
    `${$const.valueType}.const`,
    $const.value
  ];

  const emitFunction = (func: Function): unknown[] => {
    const { id, locals, instructions, functionType } = func;
    const body: unknown[] = [];

    // (local $0 XX)
    if (locals.length) {
      body.push(...locals.map(local => ["local", local.id, local.valueType]));
    }

    const emitResult = (result?: ValueType): unknown[] | undefined =>
      result ? ["result", result] : undefined;

    // body
    const emitInstruction = (instruction: Instruction): unknown[] => {
      switch (instruction.instructionType) {
        case "variable":
          return [instruction.operation, instruction.id];

        case "call":
          return ["call", instruction.id];

        case "const":
          return emitConst(instruction);

        case "comment":
          return [";", instruction.value, ";"];

        case "unaryOperation":
        case "binaryOperation":
          return [instruction.operation];

        case "if":
          return [
            "if",
            ...instruction.condition.map(emitInstruction),
            ["then", ...instruction.then.map(emitInstruction)],
            ...(instruction.$else ? [["else", ...instruction.$else.map(emitInstruction)]] : [])
          ];

        case "loop":
          return [instruction.instructionType, ...instruction.instructions.map(emitInstruction)];

        case "block":
          return [
            instruction.instructionType,
            emitResult(instruction.resultType),
            ...instruction.instructions.map(emitInstruction)
          ];

        case "br":
        case "br_if":
          return [instruction.instructionType, instruction.labelIndex];
      }
    };

    // Append instructions to body
    body.push(...instructions.map(emitInstruction));

    // func (param XX)* (result YY) body
    return [
      "func",
      id,
      ...functionType.params.map(p => ["param", p.id, p.valueType]),
      emitResult(functionType.resultType),
      ...body
    ];
  };

  const emitExport = (ex: Export): unknown[] => ["export", `"${ex.name}"`, [ex.exportType, ex.id]];

  const emitImport = (im: Import): unknown[] => {
    let importType: unknown[];
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
    return ["import", `"${im.module}"`, `"${im.name}"`, importType];
  };

  const emitDataSegment = (data: DataSegment): unknown[] => [
    "data",
    emitConst(data.offset),
    `"${data.string}\\00"`
  ];

  const module = [
    "module",
    ...ast.imports.map(emitImport),
    ...ast.memories.map(emitMemory),
    ...ast.functions.map(emitFunction),
    ...ast.exports.map(emitExport),
    ...ast.dataSegments.map(emitDataSegment)
  ];
  return format(module);
};
