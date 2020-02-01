import {
  Module,
  FunctionType,
  MemoryImportType,
  FunctionImportType,
  ImportType,
  Import,
  Identifier,
  Function,
  Instruction,
  ConstInstruction,
  MemoryType
} from "../../ast";
import {
  unsignedLEB128,
  ieee754,
  signedLEB128,
  encodeName,
  encodeVector,
  encodeNullTerminatedString
} from "./encoding";
import { countUnique, arrayEquals } from "../../../utils/array-utils";
import { getOrThrow } from "../../../utils/map-utils";

// https://webassembly.github.io/spec/core/binary/modules.html#sections
const sections = {
  type: 1,
  import: 2,
  func: 3,
  memory: 5,
  export: 7,
  code: 10,
  data: 11
};

// https://webassembly.github.io/spec/core/binary/types.html#value-types
const valueTypes = {
  i32: 0x7f,
  f32: 0x7d
};

// https://webassembly.github.io/spec/core/binary/instructions.html
const opcodes = {
  block: 0x02,
  loop: 0x03,
  if: 0x04,
  else: 0x05,
  br: 0x0c,
  // eslint-disable-next-line @typescript-eslint/camelcase
  br_if: 0x0d,
  end: 0x0b,
  call: 0x10,
  "local.get": 0x20,
  "local.set": 0x21,
  "local.tee": 0x22,
  "i32.const": 0x41,
  "f32.const": 0x43,
  "i32.eqz": 0x45,
  "i32.eq": 0x46,
  "i32.ne": 0x47,
  "i32.lt_s": 0x48,
  "i32.gt_s": 0x4a,
  "i32.le_s": 0x4c,
  "i32.ge_s": 0x4e,
  "i32.add": 0x6a,
  "i32.sub": 0x6b,
  "i32.mul": 0x6c,
  "i32.div_s": 0x6d,
  "i32.and": 0x71,
  "i32.or": 0x72,
  "i32.xor": 0x73,
  "f32.ceil": 0x8d,
  "f32.floor": 0x8e,
  "f32.nearest": 0x90,
  "i32.trunc_f32_s": 0xa8,
  "f32.convert_i32_s": 0xb2
};

const blockTypes = {
  void: 0x40
};

const encodeMemoryType = (memoryType: MemoryType): number[] =>
  memoryType.maxSize != null
    ? [0x01, memoryType.minSize, memoryType.maxSize]
    : [0x00, memoryType.minSize];

const encodeSection = (sectionId: number, data: number[]): number[] =>
  data.length && !arrayEquals(data, [0x00]) ? [sectionId, ...encodeVector(data)] : [];

export const emitWasm = (ast: Module): Uint8Array => {
  const encodeConst = (instruction: ConstInstruction): number[] => {
    switch (instruction.valueType) {
      case "i32":
        return [opcodes["i32.const"], ...signedLEB128(instruction.value)];
      case "f32":
        return [opcodes["f32.const"], ...ieee754(instruction.value)];
      default:
        throw new Error("Unknown value type for const");
    }
  };

  /**
   * Type Section
   * https://webassembly.github.io/spec/core/binary/modules.html#type-section
   */
  const astFuncImportTypes = ast.imports.reduce(
    (all, im) => (im.importType.name === "func" ? [...all, im.importType] : all),
    [] as FunctionImportType[]
  );

  const functionTypeIndices = new Map<Identifier, number>([
    ...astFuncImportTypes.map<[Identifier, number]>((it, index) => [it.id, index]),
    ...ast.functions.map<[Identifier, number]>((fn, index) => [
      fn.id,
      index + astFuncImportTypes.length
    ])
  ]);

  const encodeFunctionType = (type: FunctionType): number[] => {
    const params = encodeVector(type.params.map(p => valueTypes[p.valueType]));
    const result = encodeVector(type.resultType ? [valueTypes[type.resultType]] : []);
    return [0x60, ...params, ...result];
  };

  // TODO: Some types may be the same, so we can just point to them,
  // rather than repeating the same types
  const typeSection = encodeSection(
    sections.type,
    encodeVector([
      ...astFuncImportTypes.map(it => encodeFunctionType(it.functionType)),
      ...ast.functions.map(fn => encodeFunctionType(fn.functionType))
    ])
  );

  /**
   * Import Section
   * https://webassembly.github.io/spec/core/binary/modules.html#import-section
   */
  const importDesc = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    func: (index: number, importType: ImportType): number[] => {
      return [0x00, index];
    },
    memory: (index: number, importType: ImportType): number[] => {
      const { memoryType } = importType as MemoryImportType;
      return [0x02, ...encodeMemoryType(memoryType)];
    }
  };
  const importSection = encodeSection(
    sections.import,
    encodeVector(
      ast.imports.map((im: Import, index: number) => [
        ...encodeName(im.module),
        ...encodeName(im.name),
        ...importDesc[im.importType.name](index, im.importType)
      ])
    )
  );

  /**
   * Function Section
   * https://webassembly.github.io/spec/core/binary/modules.html#function-section
   */
  const funcSection = encodeSection(
    sections.func,
    encodeVector(ast.functions.map(fn => getOrThrow(functionTypeIndices, fn.id)))
  );

  /**
   * Memory Section
   * https://webassembly.github.io/spec/core/binary/modules.html#memory-section
   */
  const memorySection = encodeSection(
    sections.memory,
    encodeVector(ast.memories.map(mem => encodeMemoryType(mem.memoryType)))
  );

  /**
   * Export Section
   * https://webassembly.github.io/spec/core/binary/modules.html#export-section
   */
  const exportDesc = {
    func: 0x00,
    memory: 0x02
  };
  const exportSection = encodeSection(
    sections.export,
    encodeVector(
      ast.exports.map(ex => [
        ...encodeName(ex.name),
        exportDesc[ex.exportType],
        functionTypeIndices.get(ex.id) as number
      ])
    )
  );

  /**
   * Code Section
   * https://webassembly.github.io/spec/core/binary/modules.html#code-section
   */
  const encodeLocal = (count: number, valueType: number): number[] => [
    ...unsignedLEB128(count),
    valueType
  ];

  const encodeFunctionCode = (func: Function): number[] => {
    const paramAndLocalMap = new Map<Identifier, number[]>(
      [
        ...func.functionType.params.map(param => param.id),
        ...func.locals.map(local => local.id)
      ].map((id, index) => [id, unsignedLEB128(index)])
    );

    const code: number[] = [];

    const emitInstruction = (instruction: Instruction): number[] => {
      switch (instruction.instructionType) {
        case "variable":
          return [opcodes[instruction.operation], ...getOrThrow(paramAndLocalMap, instruction.id)];

        case "call":
          return [opcodes.call, getOrThrow(functionTypeIndices, instruction.id)];

        case "const":
          return encodeConst(instruction);

        case "comment":
          return [];

        case "unaryOperation":
        case "binaryOperation":
          return [opcodes[instruction.operation]];

        case "if":
          return [
            ...instruction.condition.flatMap(emitInstruction),
            opcodes.if,
            blockTypes.void,
            ...instruction.then.flatMap(emitInstruction),
            ...(instruction.$else
              ? [opcodes.else, ...instruction.$else.flatMap(emitInstruction)]
              : []),
            opcodes.end
          ];

        case "loop":
          return [
            opcodes.loop,
            blockTypes.void,
            ...instruction.instructions.flatMap(emitInstruction),
            opcodes.end
          ];

        case "block":
          return [
            opcodes.block,
            instruction.resultType ? valueTypes[instruction.resultType] : blockTypes.void,
            ...instruction.instructions.flatMap(emitInstruction),
            opcodes.end
          ];

        case "br":
        case "br_if":
          return [opcodes[instruction.instructionType], ...unsignedLEB128(instruction.labelIndex)];
      }
    };

    // Append instructions to body
    code.push(...func.instructions.flatMap(emitInstruction));

    const declaredLocals = encodeVector(
      countUnique(func.locals.map(local => local.valueType)).map(([valueType, count]) =>
        encodeLocal(count, valueTypes[valueType])
      )
    );
    return encodeVector([...declaredLocals, ...code, opcodes.end]);
  };
  const codeSection = encodeSection(
    sections.code,
    encodeVector(ast.functions.map(encodeFunctionCode))
  );

  /**
   * Data Section
   * https://webassembly.github.io/spec/core/binary/modules.html#data-section
   */
  const dataSection = encodeSection(
    sections.data,
    encodeVector(
      ast.dataSegments.map(seg => [
        ...unsignedLEB128(0), // memory index is 0 as we only support a single memory
        ...[...encodeConst(seg.offset), opcodes.end],
        ...encodeNullTerminatedString(seg.string)
      ])
    )
  );

  // https://webassembly.github.io/spec/core/binary/modules.html#binary-module
  const magic = [0x00, 0x61, 0x73, 0x6d];
  const version = [0x01, 0x00, 0x00, 0x00];

  return Uint8Array.from([
    ...magic,
    ...version,
    ...typeSection,
    ...importSection,
    ...funcSection,
    ...memorySection,
    ...exportSection,
    ...codeSection,
    ...dataSection
  ]);
};
