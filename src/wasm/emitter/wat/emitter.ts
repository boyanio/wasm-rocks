import { Module, Function, Memory, Export, Import, Instruction } from "../../ast";
import { WatFormatter } from "./formatter";

export const emitWat = (ast: Module, format: WatFormatter): string => {
  const emitMemory = (memory: Memory): unknown[] => [
    "memory",
    memory.id,
    memory.memoryType.minSize,
    memory.memoryType.maxSize ? memory.memoryType.maxSize : undefined
  ];

  const emitFunction = (func: Function): unknown[] => {
    const { id, locals, instructions, functionType } = func;
    const body: unknown[] = [];

    // (local $0 XX)
    if (locals.length) {
      body.push(...locals.map(local => ["local", local.id, local.valueType]));
    }

    // body
    const emitInstruction = (instruction: Instruction): unknown[] => {
      switch (instruction.instructionType) {
        case "variable":
          return [`local.${instruction.operation}`, instruction.id];

        case "call":
          return ["call", instruction.id];

        case "const":
          return [`${instruction.valueType}.const`, instruction.value];

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
          return [
            "block",
            [
              "loop",
              ["br_if", 1, ...instruction.condition.map(emitInstruction), ["i32.eqz"]],
              ...instruction.body.map(emitInstruction),
              ["br", 0]
            ]
          ];
      }
    };

    for (const instruction of instructions) {
      body.push(emitInstruction(instruction));
    }

    // func (param XX)* (result YY) body
    return [
      "func",
      id,
      ...functionType.params.map(p => ["param", p.id, p.valueType]),
      ...(functionType.result ? [functionType.result] : []).map(r => ["result", r]),
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

  const module = [
    "module",
    ...ast.imports.map(emitImport),
    ...ast.memories.map(emitMemory),
    ...ast.functions.map(emitFunction),
    ...ast.exports.map(emitExport)
  ];
  return format(module);
};
